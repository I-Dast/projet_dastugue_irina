import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Pollution } from '../models/pollution';

export class PollutionServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'PollutionServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  // L’URL vient de la configuration Angular, ce qui permet de la changer selon l’environnement.
  // Le replace enlève une éventuelle barre finale afin d’éviter un double « // ».
  private readonly endpoint = `${environment.apiBaseUrl.replace(/\/$/, '')}/tp3/pollution`;

  /** Étape initiale : récupère toutes les pollutions enregistrées par l’API. */
  list(): Observable<Pollution[]> {
    return this.withErrorHandling(
      this.http.get<Pollution[]>(this.endpoint),
      'Impossible de charger les pollutions',
      'Une erreur est survenue lors du chargement des pollutions.',
    );
  }

  /**
   * Récupère une déclaration précise.
   * encodeURIComponent protège l’identifiant lorsqu’il est ajouté à l’URL.
   */
  getById(id: string): Observable<Pollution> {
    return this.withErrorHandling(
      this.http.get<Pollution>(`${this.endpoint}/${encodeURIComponent(id)}`),
      'Impossible de charger le détail',
      'Une erreur est survenue lors du chargement du détail.',
      'Cette pollution n’existe pas.',
    );
  }

  /** Étape initiale : crée une pollution ; l’identifiant est attribué par l’API. */
  create(pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.withErrorHandling(
      this.http.post<Pollution>(this.endpoint, pollution),
      'Impossible d’ajouter la pollution',
      'Une erreur est survenue lors de l’ajout de la pollution.',
    );
  }

  /**
   * Étape 4 : remplace sur le serveur les champs d’une pollution existante.
   * Le corps n’inclut pas id, car l’identifiant est déjà transmis dans l’URL.
   */
  update(id: number | string, pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.withErrorHandling(
      this.http.put<Pollution>(
        `${this.endpoint}/${encodeURIComponent(id)}`,
        pollution,
      ),
      'Impossible de modifier la pollution',
      'Une erreur est survenue lors de la modification de la pollution.',
    );
  }

  /** Étape 5 : demande à l’API de supprimer la pollution identifiée. */
  delete(id: number | string): Observable<void> {
    return this.withErrorHandling(
      this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`),
      'Impossible de supprimer la pollution',
      'Une erreur est survenue lors de la suppression de la pollution.',
    );
  }

  getErrorMessage(error: unknown): string {
    return error instanceof PollutionServiceError
      ? error.message
      : 'Une erreur inattendue est survenue lors de l’appel à l’API.';
  }

  private withErrorHandling<T>(
    request: Observable<T>,
    httpFailureMessage: string,
    unexpectedFailureMessage: string,
    notFoundMessage?: string,
  ): Observable<T> {
    return request.pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          const message =
            error.status === 404 && notFoundMessage
              ? notFoundMessage
              : `${httpFailureMessage} (erreur HTTP ${error.status}).`;

          return throwError(() => new PollutionServiceError(message, error.status));
        }

        return throwError(() => new PollutionServiceError(unexpectedFailureMessage));
      }),
    );
  }
}
