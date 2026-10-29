<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
=======
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Active HttpClient pour les appels REST du PollutionService.
    provideHttpClient(
      withInterceptors(environment.useMock ? [mockBackendInterceptor] : []),
    ),
    // Active la navigation déclarée dans app.routes.ts.
    provideRouter(routes),
  ]
>>>>>>> 1e85533251dc9f86d7a4706aefe60ae74d3fb02e
};
