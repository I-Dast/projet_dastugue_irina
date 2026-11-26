import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { Signup } from './signup';
import { UserService } from '../../services/user.service';
import { AuthState } from '../../store/auth.state';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthState]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create the user registration form', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.login).toBeDefined();
    expect(component.form.controls.nom).toBeDefined();
    expect(component.form.controls.prenom).toBeDefined();
    expect(component.form.controls.telephone).toBeDefined();
    expect(fixture.nativeElement.querySelector('#dateNaissance')).toBeNull();
    expect(fixture.nativeElement.querySelector('#adresse')).toBeNull();
  });

  it('requires matching passwords', () => {
    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('different123');

    expect(component.form.hasError('passwordMismatch')).toBe(true);

    component.form.controls.confirmPassword.setValue('password123');
    expect(component.form.hasError('passwordMismatch')).toBe(false);
  });

  it('does not send an invalid form', () => {
    component.submit();

    expect(component.form.touched).toBe(true);
    expect(component.isSubmitting()).toBe(false);
  });

  it('navigates to the login page from the existing-account button', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const button = fixture.nativeElement.querySelector(
      '.existing-account-button',
    ) as HTMLButtonElement;

    expect(button.textContent.trim()).toBe("J'ai déjà un compte");
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('submits the user details without the confirmation field', () => {
    component.form.setValue({
      login: 'ada.lovelace',
      password: 'password123',
      confirmPassword: 'password123',
      nom: 'Lovelace',
      prenom: 'Ada',
      email: 'ada@example.com',
      telephone: '+33123456789',
    });

    const router = TestBed.inject(Router);
    const userService = TestBed.inject(UserService);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    component.submit();

    const request = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'ada.lovelace',
      password: 'password123',
      nom: 'Lovelace',
      prenom: 'Ada',
      email: 'ada@example.com',
      telephone: '+33123456789',
    });
    expect(request.request.body.confirmPassword).toBeUndefined();
    request.flush({
      id: 1,
      login: 'ada.lovelace',
      nom: 'Lovelace',
      prenom: 'Ada',
      email: 'ada@example.com',
      telephone: '+33123456789',
      isAdmin: false,
    });
    expect(component.successMessage()).toBe('Inscription enregistrée avec succès.');
    expect(navigateSpy).toHaveBeenCalledWith('/pollutions');
    expect(userService.isAuthenticated()).toBe(true);
  });
});
