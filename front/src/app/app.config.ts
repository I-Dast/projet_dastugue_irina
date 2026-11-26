import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';
import { AuthState } from './store/auth.state';
import { PollutionsState } from './store/pollutions.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Active HttpClient pour les appels REST du PollutionService.
    provideHttpClient(
      withInterceptors(environment.useMock ? [mockBackendInterceptor] : []),
    ),
    provideStore(
      [PollutionsState, AuthState],
      withNgxsStoragePlugin({ keys: ['auth'] }),
    ),
    // Active la navigation déclarée dans app.routes.ts.
    provideRouter(routes),
  ]
};
