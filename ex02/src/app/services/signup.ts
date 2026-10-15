import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Forme des données envoyées par le formulaire au service.
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// Forme de la réponse attendue de l'API/mock.
export interface SignupResponse {
  id: string | number;
  name: string;
  email: string;
  password: string;
}

// providedIn: 'root' rend le service injectable dans toute l'application.
@Injectable({ providedIn: 'root' })
export class SignupService {
  private readonly http = inject(HttpClient);

  // Le service encapsule la requête : URL, méthode HTTP, données et type de réponse.
  signup(data: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(
      // L'URL de base vient de l'environnement ; seule la route est définie ici.
      `${environment.apiUrl}/users`,
      data,
    );
  }
}