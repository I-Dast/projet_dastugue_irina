import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Active HttpClient pour les appels REST du PollutionService.
    provideHttpClient(),
    // Active la navigation déclarée dans app.routes.ts.
    provideRouter(routes),
  ]
};
