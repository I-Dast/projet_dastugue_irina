import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollutionDeclaration, RecapitulatifPollutionDeclaree } from './recap';

describe('RecapitulatifPollutionDeclaree', () => {
  let component: RecapitulatifPollutionDeclaree;
  let fixture: ComponentFixture<RecapitulatifPollutionDeclaree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecapitulatifPollutionDeclaree],
    }).compileComponents();

    fixture = TestBed.createComponent(RecapitulatifPollutionDeclaree);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pollution', {
      titreDeclarationDePollution: 'Pollution de la rivière',
      typePollution: 'Chimique',
      description: 'Une description de test',
      dateObservation: '2026-10-08',
      lieu: 'Saint-Étienne',
      latitude: 45.4397,
      longitude: 4.3872,
      photoUrl: 'https://example.com/photo.jpg',
    } satisfies PollutionDeclaration);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all declaration data and the optional photo', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent as string;
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(content).toContain('Pollution de la rivière');
    expect(content).toContain('Chimique');
    expect(content).toContain('Une description de test');
    expect(content).toContain('08/10/2026');
    expect(content).toContain('Saint-Étienne');
    expect(content).toContain('45.4397');
    expect(content).toContain('4.3872');
    expect(image.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('should omit the image when no photo URL is provided', () => {
    fixture.componentRef.setInput('pollution', {
      titreDeclarationDePollution: 'Pollution de la rivière',
      typePollution: 'Chimique',
      description: 'Une description de test',
      dateObservation: '2026-10-08',
      lieu: 'Saint-Étienne',
      latitude: 45.4397,
      longitude: 3.3872,
      photoUrl: '',
    } satisfies PollutionDeclaration);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Aucune photo n’a été fournie.');
  });

  it('should lay out recap fields responsively', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.recap-card')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.recap-details')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.recap-item--full')).not.toBeNull();
  });
});
