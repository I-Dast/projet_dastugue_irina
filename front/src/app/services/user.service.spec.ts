import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
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
    adresse: '1 rue des Tests',
    email: 'ada@example.com',
    telephone: '+33123456789',
    dateNaissance: '1815-12-10',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
      adresse: userProfile.adresse,
      email: userProfile.email,
      telephone: userProfile.telephone,
      dateNaissance: userProfile.dateNaissance,
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

  it('lists users using the public users endpoint', () => {
    service.list().subscribe((users) => {
      expect(users).toEqual([userProfile]);
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/users`);
    expect(request.request.method).toBe('GET');
    request.flush([userProfile]);
  });

  it('deletes a user by encoded id', () => {
    let completed = false;
    service.delete('user/1').subscribe(() => {
      completed = true;
    });

    const request = httpTesting.expectOne(`${apiEndpoint}/users/user%2F1`);
    expect(request.request.method).toBe('DELETE');
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
});
