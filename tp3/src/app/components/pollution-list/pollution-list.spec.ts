import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionList } from './pollution-list';

describe('PollutionList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should submit a pollution and display the backend response', async () => {
    const fixture = TestBed.createComponent(PollutionList);
    const component = fixture.componentInstance;
    const httpTestingController = TestBed.inject(HttpTestingController);
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

    fixture.detectChanges();
    const listRequest = httpTestingController.expectOne('http://localhost:53903/tp3/pollution');
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    component.pollutionForm.setValue({
      titreDeclarationDePollution: pollution.titreDeclarationDePollution,
      typePollution: pollution.typePollution,
      description: pollution.description,
      dateObservation: pollution.dateObservation,
      lieu: pollution.lieu,
      latitude: pollution.latitude,
      longitude: pollution.longitude,
      photoUrl: pollution.photoUrl,
    });
    component.addPollution();

    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(component.pollutionForm.getRawValue());
    request.flush(pollution);
    await fixture.whenStable();

    expect(component.pollutions()).toEqual([pollution]);
    expect(component.successMessage()).toBe('La pollution a été ajoutée.');
    expect(component.recapPollution()).toEqual(pollution);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Voici le récapitulatif des informations enregistrées.');

    fixture.nativeElement.querySelector('.dismiss-button').click();
    fixture.detectChanges();
    expect(component.recapPollution()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    httpTestingController.verify();
  });

  it('should show required-field errors when submitting an incomplete pollution', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution').flush([]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form button[type="submit"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Le titre est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Le type de pollution est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('La description est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('La date de l’observation est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Le lieu est obligatoire.');
    httpTestingController.expectNone('http://localhost:53903/tp3/pollution');
    httpTestingController.verify();
  });

  it('should fill in coordinates from the device location', async () => {
    const fixture = TestBed.createComponent(PollutionList);
    const geolocationService = TestBed.inject(GeolocationService);
    const locationSpy = vi
      .spyOn(geolocationService, 'getCurrentPosition')
      .mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 });

    await fixture.componentInstance.locateDevice();

    expect(locationSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.pollutionForm.controls.latitude.value).toBe(48.8566);
    expect(fixture.componentInstance.pollutionForm.controls.longitude.value).toBe(2.3522);
    expect(fixture.componentInstance.isLocating()).toBe(false);
    locationSpy.mockRestore();
  });

  it('should load and render existing pollutions with a detail link', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTestingController = TestBed.inject(HttpTestingController);
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

    fixture.detectChanges();
    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution');
    expect(request.request.method).toBe('GET');
    request.flush([pollution]);
    fixture.detectChanges();

    expect(fixture.componentInstance.pollutions()).toEqual([pollution]);
    expect(fixture.nativeElement.textContent).toContain('Déchets sur la plage');
    expect(fixture.nativeElement.querySelector('.detail-link')?.getAttribute('href')).toBe(
      '/pollutions/1',
    );
    httpTestingController.verify();
  });

  it('should delete a pollution after confirmation', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
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

    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution').flush([pollution]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.delete-button').click();
    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1');
    expect(confirmSpy).toHaveBeenCalled();
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    fixture.detectChanges();

    expect(fixture.componentInstance.pollutions()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('La pollution a été supprimée.');
    httpTestingController.verify();
    confirmSpy.mockRestore();
  });

  it('should not delete a pollution when confirmation is cancelled', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
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

    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution').flush([pollution]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();

    expect(fixture.componentInstance.pollutions()).toEqual([pollution]);
    httpTestingController.expectNone('http://localhost:53903/tp3/pollution/1');
    httpTestingController.verify();
    confirmSpy.mockRestore();
  });

  it('should combine text, type, location, and date filters and reset them', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const pollutions = [
      {
        id: 1,
        titreDeclarationDePollution: 'Déchets sur la plage',
        typePollution: 'Plastique' as const,
        description: 'Des déchets plastiques sont visibles sur le sable.',
        dateObservation: '2026-10-21',
        lieu: 'Plage de test',
        latitude: 48.1,
        longitude: -1.7,
        photoUrl: '',
      },
      {
        id: 2,
        titreDeclarationDePollution: 'Déversement en forêt',
        typePollution: 'Chimique' as const,
        description: 'Un liquide est répandu près des arbres.',
        dateObservation: '2026-10-22',
        lieu: 'Forêt de test',
        latitude: 48.2,
        longitude: -1.8,
        photoUrl: '',
      },
      {
        id: 3,
        titreDeclarationDePollution: 'Plastique dans le port',
        typePollution: 'Plastique' as const,
        description: 'Des déchets flottent dans le port.',
        dateObservation: '2026-10-10',
        lieu: 'Port de test',
        latitude: 48.3,
        longitude: -1.9,
        photoUrl: '',
      },
    ];

    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution').flush(pollutions);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.searchText.set('plastique');
    component.typeFilter.set('Plastique');
    component.locationFilter.set('plage');
    component.dateFromFilter.set('2026-10-20');
    component.dateToFilter.set('2026-10-22');
    fixture.detectChanges();

    expect(component.filteredPollutions()).toEqual([pollutions[0]]);
    expect(fixture.nativeElement.textContent).toContain('Déchets sur la plage');
    expect(fixture.nativeElement.textContent).not.toContain('Plastique dans le port');

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredPollutions()).toEqual(pollutions);
    httpTestingController.verify();
  });
});
