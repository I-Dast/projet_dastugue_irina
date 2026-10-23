import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Pollution } from '../models/pollution';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl.replace(/\/$/, '')}/tp3/pollution`;

  list(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.endpoint);
  }

  getById(id: string): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  create(pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.http.post<Pollution>(this.endpoint, pollution);
  }

  update(id: number | string, pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.http.put<Pollution>(
      `${this.endpoint}/${encodeURIComponent(id)}`,
      pollution,
    );
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }
}
