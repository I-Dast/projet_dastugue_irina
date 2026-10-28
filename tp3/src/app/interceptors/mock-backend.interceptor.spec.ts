import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { mockBackendInterceptor } from './mock-backend.interceptor';

describe('mockBackendInterceptor', () => {
  const endpoint = 'http://localhost:53903/tp3/pollution';
  const payload = {
    titreDeclarationDePollution: 'Déchets près du canal',
    typePollution: 'Plastique' as const,
    description: 'Des déchets sont visibles près du canal.',
    dateObservation: '2026-10-28',
    lieu: 'Strasbourg',
    latitude: 48.58,
    longitude: 7.75,
    photoUrl: '',
  };

  beforeEach(() => {
    localStorage.removeItem('tp3.mock-backend.pollutions.v1');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockBackendInterceptor]))],
    });
  });

  afterEach(() => {
    localStorage.removeItem('tp3.mock-backend.pollutions.v1');
  });

  it('handles create, list, update, and delete requests', async () => {
    const http = TestBed.inject(HttpClient);
    const created = await firstValueFrom(http.post<typeof payload & { id: number }>(endpoint, payload));

    expect(created).toEqual({ ...payload, id: 1 });
    expect(await firstValueFrom(http.get<typeof created[]>(endpoint))).toEqual([created]);

    const updatedPayload = { ...payload, lieu: 'Quai de Strasbourg' };
    const updated = await firstValueFrom(
      http.put<typeof created>(`${endpoint}/1`, updatedPayload),
    );
    expect(updated).toEqual({ ...updatedPayload, id: 1 });

    await firstValueFrom(http.delete(`${endpoint}/1`));
    expect(await firstValueFrom(http.get<typeof created[]>(endpoint))).toEqual([]);
  });

  it('returns a 404 for an unknown pollution', async () => {
    const http = TestBed.inject(HttpClient);

    await expect(firstValueFrom(http.get(`${endpoint}/42`))).rejects.toMatchObject({
      status: 404,
    });
  });
});
