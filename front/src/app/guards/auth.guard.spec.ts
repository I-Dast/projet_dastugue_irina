import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { UserService } from '../services/user.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  it('redirects an unauthenticated visitor to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/pollutions' } as RouterStateSnapshot),
    );
    //vérifie qu'une personne authentifiée est redirigée vers /login
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
  });

  it('allows a connected regular user', () => {
    TestBed.inject(UserService).startSession({
      id: 1,
      login: 'test-user',
      nom: 'Test',
      prenom: 'Utilisateur',
      email: 'test@example.com',
      telephone: '',
      isAdmin: false,
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/pollutions' } as RouterStateSnapshot),
    );
    //vérifie que le guards autorise l'accè à la page demandée
    expect(result).toBe(true);
  });
});
