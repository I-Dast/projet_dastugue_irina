import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Champs effectivement envoyés à l'API ; les données personnelles non nécessaires en sont exclues. */
export interface SignupRequest {
  login: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
}

export interface UserCredentials {
  login: string;
  password: string;
}

// Profil public partagé par les réponses utilisateur ; aucun mot de passe n'est exposé.
export interface UserProfile {
  id: string | number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  // Le préfixe /api correspond aux routes Express du backend Node.
  private readonly apiEndpoint = `${environment.apiUrl.replace(/\/$/, '')}/api`;
  private readonly usersEndpoint = `${this.apiEndpoint}/users`;
  private readonly authEndpoint = `${this.apiEndpoint}/auth`;

  // Envoie les informations du formulaire ; le serveur hache le mot de passe.
  signup(data: SignupRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.usersEndpoint, data);
  }

  // Récupère les comptes publics sans mots de passe ni hashes.
  list(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.usersEndpoint);
  }

  // Demande à l'API de supprimer le compte correspondant à cet identifiant.
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(
      `${this.usersEndpoint}/${encodeURIComponent(id)}`,
    );
  }

  // Vérifie les identifiants ; cette authentification pédagogique ne crée pas de session.
  authenticate(credentials: UserCredentials): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.authEndpoint, credentials);
  }
}
