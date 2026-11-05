import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SignupRequest, UserService } from '../../services/user.service';

const matchingPasswords: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // Le formulaire ne collecte que les informations nécessaires au compte ;
  // l’adresse et la date de naissance ne sont pas demandées.
  readonly form = this.formBuilder.nonNullable.group(
    {
      login: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^(?=.*[\p{L}\p{N}])[\p{L}\p{N}_.-]+$/u),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      nom: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^(?=.*\p{L})[\p{L} '-]+$/u),
        ],
      ],
      prenom: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^(?=.*\p{L})[\p{L} '-]+$/u),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      telephone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=(?:\D*\d){8,15}\D*$)\+?[\d\s().-]+$/),
        ],
      ],
    },
    { validators: matchingPasswords },
  );

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    // La confirmation sert uniquement à valider le formulaire et n'est jamais transmise à l'API.
    const { confirmPassword: _confirmPassword, ...data } =
      this.form.getRawValue();
    const request: SignupRequest = data;

    this.userService
      .signup(request)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Inscription enregistrée avec succès.';
          void this.router.navigateByUrl('/pollutions');
        },
        error: (error: unknown) => {
          const message =
            error instanceof HttpErrorResponse ? error.error?.message : null;
          this.errorMessage =
            typeof message === 'string'
              ? message
              : 'Impossible de contacter le serveur. Vérifiez que l’API est démarrée.';
        },
      });
  }
}
