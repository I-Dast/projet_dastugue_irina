import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionCreate } from './pollution-create';

describe('PollutionCreate', () => {
  const endpoint = `${environment.apiUrl.replace(/\/$/, '')}/api/pollutions`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionCreate],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('creates a pollution and displays the saved summary', async () => {
    const fixture = TestBed.createComponent(PollutionCreate);
    fixture.autoDetectChanges();
    const httpTesting = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;
    const pollution = {
      id: 1,
      titreDeclarationDePollution: 'Déchets sur la plage',
      typePollution: 'Plastique' as const,
      description: 'Des déchets plastiques sont visibles sur le sable.',
      dateObservation: '2026-10-21',
      lieu: 'Plage de test',
      latitude: 48.1,
      longitude: -1.7,
      photoUrl: '',
    };
    const { id: _id, ...payload } = pollution;

    component.pollutionForm.setValue(payload);
    component.addPollution();

    const request = httpTesting.expectOne(endpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(pollution);
    await fixture.whenStable();

    expect(component.recapPollution()).toEqual(pollution);
    expect(fixture.nativeElement.textContent).toContain('Déchets sur la plage');
    fixture.nativeElement.querySelector('.dismiss-button').click();
    expect(navigateSpy).toHaveBeenCalledWith('/pollutions');
    httpTesting.verify();
  });

  it('does not send an incomplete pollution', () => {
    const fixture = TestBed.createComponent(PollutionCreate);
    const httpTesting = TestBed.inject(HttpTestingController);

    fixture.componentInstance.addPollution();

    expect(fixture.componentInstance.pollutionForm.touched).toBe(true);
    httpTesting.expectNone(endpoint);
    httpTesting.verify();
  });

  it('fills in the coordinates from the browser location', async () => {
    const fixture = TestBed.createComponent(PollutionCreate);
    const geolocation = TestBed.inject(GeolocationService);
    const locationSpy = vi
      .spyOn(geolocation, 'getCurrentPosition')
      .mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 });

    await fixture.componentInstance.locateDevice();

    expect(locationSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.pollutionForm.controls.latitude.value).toBe(48.8566);
    expect(fixture.componentInstance.pollutionForm.controls.longitude.value).toBe(2.3522);
    locationSpy.mockRestore();
  });
});
