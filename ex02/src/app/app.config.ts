import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Utilise le vrai serveur JSON Server, lancé séparément sur le port 3000.
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ]
};
