import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UserCredentials, UserService } from '../../services/user.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly form = this.formBuilder.nonNullable.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  isSubmitting = false;
  errorMessage = '';

  goToSignup(): void {
    void this.router.navigateByUrl('/');
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const credentials: UserCredentials = this.form.getRawValue();

    this.userService
      .authenticate(credentials)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (user) => {
          if (user.isAdmin && !user.accessToken) {
            this.errorMessage = 'La connexion administrateur a échoué.';
            return;
          }

          this.userService.startSession(user);
          if (user.isAdmin) {
            void this.router.navigateByUrl('/admin/users');
            return;
          }

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
