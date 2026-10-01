import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-app-user-profile',
  styleUrl: './app-user-profile.css',
  templateUrl: './app-user-profile.html',
})
export class AppUserProfile {
  readonly signupForm = new FormGroup({
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  passwordConfirmation = '';
  submitted = false;
  successMessage = '';

  get passwordConfirmationRequired(): boolean {
    return this.submitted && !this.passwordConfirmation;
  }

  get passwordConfirmationMismatch(): boolean {
    return (
      this.submitted &&
      !!this.passwordConfirmation &&
      this.passwordConfirmation !== this.signupForm.controls.password.value
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';

    if (
      this.signupForm.invalid ||
      !this.passwordConfirmation ||
      this.passwordConfirmation !== this.signupForm.controls.password.value
    ) {
      return;
    }

    this.successMessage = 'Inscription validée. Le formulaire est prêt à être envoyé.';
  }
}
