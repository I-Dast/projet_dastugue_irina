import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionDetail } from './pollution-detail';

describe('PollutionDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();
  });

  // Vérifie le GET par identifiant et l’affichage des données du détail.
  it('should load and display the selected pollution', () => {
    const fixture = TestBed.createComponent(PollutionDetail);
    const httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 1,
      titreDeclarationDePollution: 'Déchets sur la plage',
      typePollution: 'Plastique',
      description: 'Des déchets plastiques sont visibles sur le sable.',
      dateObservation: '2026-10-21',
      lieu: 'Plage de test',
      latitude: 48.1,
      longitude: -1.7,
      photoUrl: '',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Déchets sur la plage');
    expect(fixture.nativeElement.textContent).toContain('21/10/2026');
    expect(fixture.nativeElement.textContent).toContain('Plage de test');
    httpTestingController.verify();
  });

  // Vérifie le traitement de la réponse HTTP 404.
  it('should show a not-found message when the pollution does not exist', () => {
    const fixture = TestBed.createComponent(PollutionDetail);
    const httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpTestingController
      .expectOne('http://localhost:53903/tp3/pollution/1')
      .flush('Not found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cette pollution n’existe pas.');
    httpTestingController.verify();
  });

  // Étape 4 : vérifie que l’édition envoie les nouveaux champs en PUT et les réaffiche.
  it('should update the selected pollution and display the saved values', () => {
    const fixture = TestBed.createComponent(PollutionDetail);
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
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1').flush(pollution);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.editForm.patchValue({ titreDeclarationDePollution: 'Pollution modifiée' });
    component.saveChanges();

    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      titreDeclarationDePollution: 'Pollution modifiée',
      typePollution: pollution.typePollution,
      description: pollution.description,
      dateObservation: pollution.dateObservation,
      lieu: pollution.lieu,
      latitude: pollution.latitude,
      longitude: pollution.longitude,
      photoUrl: pollution.photoUrl,
    });
    request.flush({ ...pollution, titreDeclarationDePollution: 'Pollution modifiée' });
    fixture.detectChanges();

    expect(component.pollution()?.titreDeclarationDePollution).toBe('Pollution modifiée');
    expect(component.isEditing()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('La pollution a été modifiée.');
    httpTestingController.verify();
  });

  // Étape 5 : après confirmation, DELETE réussit et le routeur revient à la liste.
  it('should delete the selected pollution and return to the list after confirmation', () => {
    const fixture = TestBed.createComponent(PollutionDetail);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
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
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1').flush(pollution);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.button-danger').click();
    const request = httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1');
    expect(confirmSpy).toHaveBeenCalledWith(
      'Voulez-vous vraiment supprimer la pollution « Déchets sur la plage » ?',
    );
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(navigateSpy).toHaveBeenCalledWith('/');
    httpTestingController.verify();
    confirmSpy.mockRestore();
    navigateSpy.mockRestore();
  });

  // Reprise TP2 : valide le remplissage GPS du formulaire d’édition avec un service simulé.
  it('should fill in edit coordinates from the device location', async () => {
    const fixture = TestBed.createComponent(PollutionDetail);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const geolocationService = TestBed.inject(GeolocationService);
    const locationSpy = vi
      .spyOn(geolocationService, 'getCurrentPosition')
      .mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 });

    fixture.detectChanges();
    httpTestingController.expectOne('http://localhost:53903/tp3/pollution/1').flush({
      id: 1,
      titreDeclarationDePollution: 'Déchets sur la plage',
      typePollution: 'Plastique',
      description: 'Des déchets plastiques sont visibles sur le sable.',
      dateObservation: '2026-10-21',
      lieu: 'Plage de test',
      latitude: 48.1,
      longitude: -1.7,
      photoUrl: '',
    });
    fixture.detectChanges();

    fixture.componentInstance.startEditing();
    await fixture.componentInstance.locateDevice();

    expect(locationSpy).toHaveBeenCalled();
    expect(fixture.componentInstance.editForm.controls.latitude.value).toBe(48.8566);
    expect(fixture.componentInstance.editForm.controls.longitude.value).toBe(2.3522);
    expect(fixture.componentInstance.isLocating()).toBe(false);
    httpTestingController.verify();
    locationSpy.mockRestore();
  });
});
