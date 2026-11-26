import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login, Logout } from '../store/auth.actions';
import { ADMIN_TOKEN_KEY, hasStoredSession, USER_SESSION_KEY } from './auth-session';

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
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  readonly isAuthenticated = signal(hasStoredSession());
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
      sessionStorage.setItem(ADMIN_TOKEN_KEY, user.accessToken);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    sessionStorage.setItem(USER_SESSION_KEY, 'true');
    this.isAuthenticated.set(true);
    this.store.dispatch(
      new Login({
        id: user.id,
        login: user.login,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        isAdmin: user.isAdmin,
      }),
    );
  }

  hasAdminToken(): boolean {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) !== null;
  }

  endSession(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
    this.isAuthenticated.set(false);
    this.store.dispatch(new Logout());
  }

  private adminHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

}
