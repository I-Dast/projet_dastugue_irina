import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { signupMockInterceptor } from './mocks/signup-mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Active HttpClient et branche le mock qui simule l'API faute de backend.
    provideHttpClient(withInterceptors([signupMockInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ]
};
