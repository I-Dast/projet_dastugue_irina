import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Pollution } from '../models/pollution';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  // L’URL vient de la configuration Angular, ce qui permet de la changer selon l’environnement.
  // Le replace enlève une éventuelle barre finale afin d’éviter un double « // ».
  private readonly endpoint = `${environment.apiBaseUrl.replace(/\/$/, '')}/tp3/pollution`;

  /** Étape initiale : récupère toutes les pollutions enregistrées par l’API. */
  list(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.endpoint);
  }

  /**
   * Récupère une déclaration précise.
   * encodeURIComponent protège l’identifiant lorsqu’il est ajouté à l’URL.
   */
  getById(id: string): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  /** Étape initiale : crée une pollution ; l’identifiant est attribué par l’API. */
  create(pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.http.post<Pollution>(this.endpoint, pollution);
  }

  /**
   * Étape 4 : remplace sur le serveur les champs d’une pollution existante.
   * Le corps n’inclut pas id, car l’identifiant est déjà transmis dans l’URL.
   */
  update(id: number | string, pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.http.put<Pollution>(
      `${this.endpoint}/${encodeURIComponent(id)}`,
      pollution,
    );
  }

  /** Étape 5 : demande à l’API de supprimer la pollution identifiée. */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }
}
