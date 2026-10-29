import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SignupRequest {
  login: string;
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  password: string;
}

export interface SignupResponse extends SignupRequest {
  id: string | number;
}

@Injectable({ providedIn: 'root' })
export class SignupService {
  private readonly http = inject(HttpClient);

  signup(data: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(
      `${environment.apiUrl}/users`,
      data,
    );
  }
}
