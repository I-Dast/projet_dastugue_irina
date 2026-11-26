import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { provideStore, Store } from '@ngxs/store';
import { UserService } from '../services/user.service';
import { AuthState } from '../store/auth.state';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), provideStore([AuthState])],
    });
  });

  it('redirects an unauthenticated visitor to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/pollutions' } as RouterStateSnapshot),
    );
    // Vérifie qu'une personne non authentifiée est redirigée vers /login.
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
  });

  it('allows a connected regular user', () => {
    const store = TestBed.inject(Store);
    TestBed.inject(UserService).startSession({
      id: 1,
      login: 'test-user',
      nom: 'Test',
      prenom: 'Utilisateur',
      email: 'test@example.com',
      telephone: '',
      isAdmin: false,
    });

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/pollutions' } as RouterStateSnapshot),
    );
    // Vérifie que le Guard autorise l'accès à la page demandée.
    expect(result).toBe(true);
  });
});
