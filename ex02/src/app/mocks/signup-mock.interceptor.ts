import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const signupMockInterceptor: HttpInterceptorFn = (request, next) => {
  const signupUrl = `${environment.apiUrl}/auth/signup`;

  // Les autres appels HTTP continuent normalement ; seul le POST d'inscription est simulé.
  if (request.method !== 'POST' || request.url !== signupUrl) {
    return next(request);
  }

  const body: unknown = request.body;
  if (
    typeof body === 'object' &&
    body !== null &&
    'email' in body &&
    body.email === 'existant@example.com'
  ) {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { message: 'Cette adresse e-mail est déjà utilisée.' },
          status: 409,
          statusText: 'Conflict',
          url: request.url,
        }),
    );
  }

  return timer(600).pipe(
    map(
      () =>
        new HttpResponse({
          body: { message: 'Inscription réussie ! Bienvenue.' },
          status: 201,
          url: request.url,
        }),
    ),
  );
};
