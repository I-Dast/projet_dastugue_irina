import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signup } from './signup';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
    expect(component.form.controls.adresse).toBeDefined();
    expect(component.form.controls.telephone).toBeDefined();
    expect(component.form.controls.dateNaissance).toBeDefined();
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
    expect(component.isSubmitting).toBe(false);
  });

  it('submits the user details without the confirmation field', () => {
    component.form.setValue({
      login: 'ada.lovelace',
      password: 'password123',
      confirmPassword: 'password123',
      nom: 'Lovelace',
      prenom: 'Ada',
      adresse: '1 rue des Tests',
      email: 'ada@example.com',
      telephone: '+33123456789',
      dateNaissance: '1815-12-10',
    });

    component.submit();

    const request = httpTesting.expectOne('http://localhost:3000/users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'ada.lovelace',
      password: 'password123',
      nom: 'Lovelace',
      prenom: 'Ada',
      adresse: '1 rue des Tests',
      email: 'ada@example.com',
      telephone: '+33123456789',
      dateNaissance: '1815-12-10',
    });
    expect(request.request.body.confirmPassword).toBeUndefined();
    request.flush({ id: 1 });
    expect(component.successMessage).toBe('Inscription enregistrée avec succès.');
  });
});
