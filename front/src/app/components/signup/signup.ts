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
import { finalize } from 'rxjs';
import { SignupRequest, SignupService } from '../../services/signup';

const matchingPasswords: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

function validateBirthDate(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const today = new Date();
  const latestDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return value > latestDate ? { futureDate: true } : null;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly formBuilder = inject(FormBuilder);
  private readonly signupService = inject(SignupService);

  readonly today = this.getLocalDateValue(new Date());

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
      adresse: ['', [Validators.required, Validators.pattern(/^(?=.*\S).+$/u)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=(?:\D*\d){8,15}\D*$)\+?[\d\s().-]+$/),
        ],
      ],
      dateNaissance: ['', [Validators.required, validateBirthDate]],
    },
    { validators: matchingPasswords },
  );

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private getLocalDateValue(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { confirmPassword: _confirmPassword, ...data } =
      this.form.getRawValue();
    const request: SignupRequest = data;

    this.signupService
      .signup(request)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Inscription enregistrée avec succès.';
          this.form.reset();
        },
        error: (error: unknown) => {
          const message =
            error instanceof HttpErrorResponse ? error.error?.message : null;
          this.errorMessage =
            typeof message === 'string'
              ? message
              : 'Impossible de contacter le serveur. Vérifiez que JSON Server fonctionne sur le port 3000.';
        },
      });
  }
}
