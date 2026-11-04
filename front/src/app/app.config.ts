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
};
