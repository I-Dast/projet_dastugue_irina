import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
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
  isAdmin: boolean;
}

export interface AuthenticationResponse extends UserProfile {
  accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly adminTokenKey = 'pollution.admin-token';
  private readonly sessionKey = 'pollution.user-session';
  private readonly http = inject(HttpClient);
  readonly isAuthenticated = signal(this.hasStoredSession());
  // Le préfixe /api correspond aux routes Express du backend Node.
  private readonly apiEndpoint = `${environment.apiUrl.replace(/\/$/, '')}/api`;
  private readonly usersEndpoint = `${this.apiEndpoint}/users`;
  private readonly authEndpoint = `${this.apiEndpoint}/auth`;

  // Envoie les informations du formulaire ; le serveur hache le mot de passe.
  signup(data: SignupRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.usersEndpoint, data);
  }

  // Récupère la liste administrateur ; l'API filtre toujours les hashes côté serveur.
  list(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.usersEndpoint, {
      headers: this.adminHeaders(),
    });
  }

  // Demande à l'API de supprimer le compte correspondant à cet identifiant.
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(
      `${this.usersEndpoint}/${encodeURIComponent(id)}`,
      { headers: this.adminHeaders() },
    );
  }

  authenticate(credentials: UserCredentials): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(this.authEndpoint, credentials);
  }

  startSession(user: AuthenticationResponse): void {
    if (user.isAdmin && user.accessToken) {
      sessionStorage.setItem(this.adminTokenKey, user.accessToken);
    } else {
      sessionStorage.removeItem(this.adminTokenKey);
    }
    sessionStorage.setItem(this.sessionKey, 'true');
    this.isAuthenticated.set(true);
  }

  hasAdminToken(): boolean {
    return sessionStorage.getItem(this.adminTokenKey) !== null;
  }

  endSession(): void {
    sessionStorage.removeItem(this.adminTokenKey);
    sessionStorage.removeItem(this.sessionKey);
    this.isAuthenticated.set(false);
  }

  private adminHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(this.adminTokenKey);
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private hasStoredSession(): boolean {
    return (
      typeof sessionStorage !== 'undefined' &&
      (sessionStorage.getItem(this.sessionKey) === 'true' ||
        sessionStorage.getItem(this.adminTokenKey) !== null)
    );
  }
}
