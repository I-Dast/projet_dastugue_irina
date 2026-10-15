import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SignupService } from './signup';

describe('SignupService', () => {
  let service: SignupService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SignupService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts signup data to the configured endpoint', () => {
    const data = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    };
    service.signup(data).subscribe((response) => {
      expect(response.id).toBe('1');
      expect(response.email).toBe(data.email);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    request.flush({ id: '1', ...data });
  });
});
