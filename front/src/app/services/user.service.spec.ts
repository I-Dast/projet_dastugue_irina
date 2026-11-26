import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { environment } from '../../environments/environment';
import { AuthState } from '../store/auth.state';
import { UserCredentials, UserProfile, UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;
  const apiEndpoint = `${environment.apiUrl.replace(/\/$/, '')}/api`;
  const userProfile: UserProfile = {
    id: 1,
    login: 'ada.lovelace',
    nom: 'Lovelace',
    prenom: 'Ada',
    email: 'ada@example.com',
    telephone: '+33123456789',
    isAdmin: false,
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthState]),
      ],
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('creates a user without sending password confirmation', () => {
    const requestBody = {
      login: userProfile.login,
      nom: userProfile.nom,
      prenom: userProfile.prenom,
      email: userProfile.email,
      telephone: userProfile.telephone,
      password: 'password123',
    };

    service.signup(requestBody).subscribe((user) => {
      expect(user).toEqual(userProfile);
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush(userProfile);
  });

  it('lists users using the protected users endpoint', () => {
    service.startSession({
      ...userProfile,
      isAdmin: true,
      accessToken: 'signed-admin-token',
    });
    service.list().subscribe((users) => {
      expect(users).toEqual([userProfile]);
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/users`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer signed-admin-token');
    request.flush([userProfile]);
  });

  it('deletes a user by encoded id', () => {
    service.startSession({
      ...userProfile,
      isAdmin: true,
      accessToken: 'signed-admin-token',
    });
    let completed = false;
    service.delete('user/1').subscribe(() => {
      completed = true;
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/users/user%2F1`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer signed-admin-token');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBe(true);
  });

  it('posts credentials to the fictitious authentication endpoint', () => {
    const credentials: UserCredentials = {
      login: userProfile.login,
      password: 'password123',
    };

    service.authenticate(credentials).subscribe((user) => {
      expect(user).toEqual(userProfile);
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/auth`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(userProfile);
  });

  it('tracks a regular-user session and clears it on logout', () => {
    const store = TestBed.inject(Store);
    service.startSession(userProfile);
    expect(service.isAuthenticated()).toBe(true);
    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.user)).toEqual(userProfile);
    expect(store.selectSnapshot(AuthState.username)).toBe(userProfile.login);

    service.endSession();

    expect(service.isAuthenticated()).toBe(false);
    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
    expect(store.selectSnapshot(AuthState.username)).toBeNull();
    expect(service.hasAdminToken()).toBe(false);
  });
});
