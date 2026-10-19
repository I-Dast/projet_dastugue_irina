import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SignupRequest, SignupService } from '../../services/signup';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  // Injection de dépendance : Angular fournit ici l'instance du service.
  private readonly signupService = inject(SignupService);

  // Formulaire réactif : champs et règles de validation avant l'appel au service.
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  submit(): void {
    // Empêche l'envoi des champs invalides ou un double envoi pendant le traitement.
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Le composant récupère les valeurs puis délègue l'appel HTTP au service injecté.
    const data: SignupRequest = this.form.getRawValue();
    this.signupService
      .signup(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          // La réponse du service confirme l'enregistrement dans JSON Server.
          this.successMessage = 'Inscription enregistrée avec succès.';
          this.form.reset();
        },
        error: (error: unknown) => {
          // Le composant gère l'affichage d'erreur ; il ne construit pas la requête HTTP.
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
