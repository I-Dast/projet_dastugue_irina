import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PollutionList } from './pollution-list';

describe('PollutionList', () => {
  const endpoint = `${environment.apiUrl.replace(/\/$/, '')}/api/pollutions`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  // Vérifie le chargement, l’accès au détail et le bouton menant au formulaire séparé.
  it('should list pollutions with detail and create links', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTesting = TestBed.inject(HttpTestingController);
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
    const request = httpTesting.expectOne(endpoint);
    expect(request.request.method).toBe('GET');
    request.flush([pollution]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(pollution.titreDeclarationDePollution);
    expect(fixture.nativeElement.querySelector('.detail-link')?.getAttribute('href')).toBe(
      '/pollutions/1',
    );
    expect(fixture.nativeElement.querySelector('.add-pollution-link')?.getAttribute('href')).toBe(
      '/pollutions/new',
    );
    httpTesting.verify();
  });

  // La suppression actualise la liste uniquement après la confirmation du serveur.
  it('should delete a pollution after confirmation', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTesting = TestBed.inject(HttpTestingController);
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
    httpTesting.expectOne(endpoint).flush([pollution]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();

    const request = httpTesting.expectOne(`${endpoint}/1`);
    expect(confirmSpy).toHaveBeenCalled();
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    fixture.detectChanges();

    expect(fixture.componentInstance.pollutions()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('La pollution a été supprimée.');
    httpTesting.verify();
    confirmSpy.mockRestore();
  });

  // Annuler la confirmation conserve l’élément et n’envoie aucune suppression.
  it('should keep a pollution when deletion is cancelled', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTesting = TestBed.inject(HttpTestingController);
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
    httpTesting.expectOne(endpoint).flush([pollution]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();

    expect(fixture.componentInstance.pollutions()).toEqual([pollution]);
    httpTesting.expectNone(`${endpoint}/1`);
    httpTesting.verify();
    confirmSpy.mockRestore();
  });

  // Les critères texte, type, lieu et dates se combinent puis peuvent être réinitialisés.
  it('should combine and reset pollution filters', () => {
    const fixture = TestBed.createComponent(PollutionList);
    const httpTesting = TestBed.inject(HttpTestingController);
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
    httpTesting.expectOne(endpoint).flush(pollutions);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.searchText.set('plastique');
    component.typeFilter.set('Plastique');
    component.locationFilter.set('plage');
    component.dateFromFilter.set('2026-10-20');
    component.dateToFilter.set('2026-10-22');
    fixture.detectChanges();

    expect(component.filteredPollutions()).toEqual([pollutions[0]]);
    component.resetFilters();
    expect(component.filteredPollutions()).toEqual(pollutions);
    httpTesting.verify();
  });
});
