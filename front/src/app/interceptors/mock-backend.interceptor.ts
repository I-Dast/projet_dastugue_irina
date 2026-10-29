import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { defer, of, throwError } from 'rxjs';
import { TYPES_POLLUTION, type Pollution } from '../models/pollution';

const STORAGE_KEY = 'tp3.mock-backend.pollutions.v1';
const POLLUTION_ROUTE = /(?:^|\/)tp3\/pollution(?:\/([^/]+))?\/?$/;

type PollutionPayload = Omit<Pollution, 'id'>;

export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const url = new URL(request.url, 'http://localhost');
  const routeMatch = POLLUTION_ROUTE.exec(url.pathname);

  if (!routeMatch) {
    return next(request);
  }

  let id: string | undefined;
  if (routeMatch[1]) {
    try {
      id = decodeURIComponent(routeMatch[1]);
    } catch {
      return throwError(() =>
        errorResponse(400, 'Identifiant de pollution invalide.', request.url),
      );
    }
  }

  return defer(() => {
    const pollutions = readPollutions(request.url);

    switch (request.method) {
      case 'GET':
        if (id === undefined) {
          return of(new HttpResponse({ body: pollutions, status: 200, url: request.url }));
        }

        return withPollution(pollutions, id, request.url, (pollution) =>
          new HttpResponse({ body: pollution, status: 200, url: request.url }),
        );

      case 'POST':
        if (id !== undefined) {
          return throwError(() => errorResponse(405, 'Méthode non autorisée.', request.url));
        }
        if (!isPollutionPayload(request.body)) {
          return throwError(() =>
            errorResponse(400, 'Données de pollution invalides.', request.url),
          );
        }

        {
          const created: Pollution = {
            ...request.body,
            id: nextId(pollutions),
          };
          writePollutions([...pollutions, created], request.url);
          return of(new HttpResponse({ body: created, status: 201, url: request.url }));
        }

      case 'PUT': {
        if (id === undefined) {
          return throwError(() => errorResponse(405, 'Méthode non autorisée.', request.url));
        }
        const updatePayload = request.body;
        if (!isPollutionPayload(updatePayload)) {
          return throwError(() =>
            errorResponse(400, 'Données de pollution invalides.', request.url),
          );
        }

        return withPollution(pollutions, id, request.url, (existing, index) => {
          const updated: Pollution = { ...updatePayload, id: existing.id };
          pollutions[index] = updated;
          writePollutions(pollutions, request.url);
          return new HttpResponse({ body: updated, status: 200, url: request.url });
        });
      }

      case 'DELETE':
        if (id === undefined) {
          return throwError(() => errorResponse(405, 'Méthode non autorisée.', request.url));
        }

        return withPollution(pollutions, id, request.url, (_pollution, index) => {
          pollutions.splice(index, 1);
          writePollutions(pollutions, request.url);
          return new HttpResponse({ body: null, status: 200, url: request.url });
        });

      default:
        return throwError(() => errorResponse(405, 'Méthode non autorisée.', request.url));
    }
  });
};

function isPollutionPayload(value: unknown): value is PollutionPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload['titreDeclarationDePollution'] === 'string' &&
    typeof payload['typePollution'] === 'string' &&
    TYPES_POLLUTION.some((type) => type === payload['typePollution']) &&
    typeof payload['description'] === 'string' &&
    typeof payload['dateObservation'] === 'string' &&
    typeof payload['lieu'] === 'string' &&
    typeof payload['latitude'] === 'number' &&
    typeof payload['longitude'] === 'number' &&
    typeof payload['photoUrl'] === 'string'
  );
}

function isPollution(value: unknown): value is Pollution {
  if (!isPollutionPayload(value)) {
    return false;
  }

  const id = (value as Record<string, unknown>)['id'];
  return typeof id === 'number' || typeof id === 'string';
}

function readPollutions(url: string): Pollution[] {
  if (typeof localStorage === 'undefined') {
    throw httpError(500, 'Le stockage local est indisponible.', url);
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(saved);
  } catch {
    throw httpError(500, 'Les données du backend simulé sont illisibles.', url);
  }

  if (!Array.isArray(parsed) || !parsed.every(isPollution)) {
    throw httpError(500, 'Les données du backend simulé sont invalides.', url);
  }

  return parsed;
}

function writePollutions(pollutions: Pollution[], url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pollutions));
  } catch {
    throw httpError(507, 'Impossible d’enregistrer les données simulées.', url);
  }
}

function nextId(pollutions: Pollution[]): number {
  const numericIds = pollutions
    .map(({ id }) => Number(id))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  return Math.max(0, ...numericIds) + 1;
}

function withPollution<T>(
  pollutions: Pollution[],
  id: string,
  url: string,
  operation: (pollution: Pollution, index: number) => HttpResponse<T>,
) {
  const index = pollutions.findIndex((pollution) => String(pollution.id) === id);
  if (index === -1) {
    return throwError(() => errorResponse(404, 'Cette pollution n’existe pas.', url));
  }

  return of(operation(pollutions[index], index));
}

function errorResponse(status: number, message: string, url: string) {
  const statusText: Record<number, string> = {
    400: 'Bad Request',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
    507: 'Insufficient Storage',
  };

  return new HttpErrorResponse({
    error: { message },
    status,
    statusText: statusText[status] ?? 'Request Failed',
    url,
  });
}

function httpError(status: number, message: string, url: string): HttpErrorResponse {
  return errorResponse(status, message, url);
}
