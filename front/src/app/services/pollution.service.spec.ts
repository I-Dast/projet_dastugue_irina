import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PollutionService } from './pollution.service';

describe('PollutionService', () => {
  let service: PollutionService;
  let httpTestingController: HttpTestingController;
  const endpoint = `${environment.apiBaseUrl}/tp3/pollution`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PollutionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('maps a not-found response to the service error message', async () => {
    const result = firstValueFrom(service.getById('42'));
    httpTestingController
      .expectOne(`${endpoint}/42`)
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    await expect(result).rejects.toMatchObject({
      message: 'Cette pollution n’existe pas.',
      status: 404,
    });
  });

  it('maps other HTTP failures to an operation-specific service error', async () => {
    const result = firstValueFrom(service.create({
      titreDeclarationDePollution: 'Déchets près du canal',
      typePollution: 'Plastique',
      description: 'Des déchets sont visibles près du canal.',
      dateObservation: '2026-10-28',
      lieu: 'Strasbourg',
      latitude: 48.58,
      longitude: 7.75,
      photoUrl: '',
    }));
    httpTestingController.expectOne(endpoint).flush('Unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(result).rejects.toMatchObject({
      message: 'Impossible d’ajouter la pollution (erreur HTTP 503).',
      status: 503,
    });
  });
});
