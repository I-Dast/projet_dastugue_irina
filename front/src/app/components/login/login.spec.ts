import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('does not send empty credentials', () => {
    component.submit();

    expect(component.form.touched).toBe(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('authenticates and navigates to the pollution list', () => {
    component.form.setValue({ login: 'ada.lovelace', password: 'password123' });

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    component.submit();

    const request = httpTesting.expectOne('http://localhost:3000/api/auth');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'ada.lovelace',
      password: 'password123',
    });
    request.flush({ id: 1 });

    expect(navigateSpy).toHaveBeenCalledWith('/pollutions');
    expect(component.isSubmitting).toBe(false);
  });

  it('shows the authentication error returned by the API', () => {
    component.form.setValue({ login: 'ada.lovelace', password: 'wrong-password' });
    component.submit();

    const request = httpTesting.expectOne('http://localhost:3000/api/auth');
    request.flush(
      { message: 'Login ou mot de passe incorrect.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.errorMessage).toBe('Login ou mot de passe incorrect.');
  });
});
