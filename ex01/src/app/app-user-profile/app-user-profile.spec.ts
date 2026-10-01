import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppUserProfile } from './app-user-profile';

describe('AppUserProfile', () => {
  let component: AppUserProfile;
  let fixture: ComponentFixture<AppUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUserProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(AppUserProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires all fields and validates the email address', () => {
    expect(component.signupForm.valid).toBe(false);

    component.signupForm.controls.login.setValue('irina');
    component.signupForm.controls.password.setValue('secret');
    component.signupForm.controls.lastName.setValue('Dastugue');
    component.signupForm.controls.firstName.setValue('Irina');
    component.signupForm.controls.email.setValue('not-an-email');

    expect(component.signupForm.invalid).toBe(true);
    expect(component.signupForm.controls.email.hasError('email')).toBe(true);
  });

  it('rejects a password confirmation that does not match', () => {
    component.signupForm.setValue({
      login: 'irina',
      password: 'secret',
      lastName: 'Dastugue',
      firstName: 'Irina',
      email: 'irina@example.com',
    });
    component.passwordConfirmation = 'different';

    component.onSubmit();

    expect(component.passwordConfirmationMismatch).toBe(true);
    expect(component.successMessage).toBe('');
  });

  it('shows a success message when the form is valid', () => {
    component.signupForm.setValue({
      login: 'irina',
      password: 'secret',
      lastName: 'Dastugue',
      firstName: 'Irina',
      email: 'irina@example.com',
    });
    component.passwordConfirmation = 'secret';

    component.onSubmit();

    expect(component.successMessage).toContain('Inscription validée');
  });
});
