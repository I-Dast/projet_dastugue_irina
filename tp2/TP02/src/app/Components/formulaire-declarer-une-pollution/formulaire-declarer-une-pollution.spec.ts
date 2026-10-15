import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormulaireDeclarerUnePollution } from './formulaire-declarer-une-pollution';

describe('FormulaireDeclarerUnePollution', () => {
  let component: FormulaireDeclarerUnePollution;
  let fixture: ComponentFixture<FormulaireDeclarerUnePollution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireDeclarerUnePollution],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireDeclarerUnePollution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require a pollution title', () => {
    const titleControl = component.profileForm.controls.titreDeclarationDePollution;

    expect(titleControl.hasError('required')).toBe(true);

    titleControl.setValue('Pollution de la rivière');

    expect(titleControl.valid).toBe(true);
  });

  it('should require a pollution type and accept a selected option', () => {
    const typeControl = component.profileForm.controls.typePollution;

    expect(typeControl.hasError('required')).toBe(true);

    typeControl.setValue('Plastique');

    expect(typeControl.valid).toBe(true);
    expect(component.profileForm.invalid).toBe(true);
  });

  it('should validate the pollution description length and forbidden characters', () => {
    const descriptionControl = component.profileForm.controls.description;

    expect(descriptionControl.hasError('required')).toBe(true);

    descriptionControl.setValue('1234567890');
    expect(descriptionControl.valid).toBe(true);

    descriptionControl.setValue('123456789');
    expect(descriptionControl.hasError('minlength')).toBe(true);

    descriptionControl.setValue('          ');
    expect(descriptionControl.hasError('pattern')).toBe(true);

    for (const forbiddenCharacter of ['<', '>', '§', '$']) {
      descriptionControl.setValue(`Pollution ${forbiddenCharacter} constatée`);
      expect(descriptionControl.hasError('pattern')).toBe(true);
    }

    descriptionControl.setValue('a'.repeat(500));
    expect(descriptionControl.valid).toBe(true);

    descriptionControl.setValue(`${'a'.repeat(499)} `);
    expect(descriptionControl.valid).toBe(true);

    descriptionControl.setValue('a'.repeat(501));
    expect(descriptionControl.hasError('maxlength')).toBe(true);
  });

  it('should require a valid observation date that is not in the future', () => {
    const dateControl = component.profileForm.controls.dateObservation;

    expect(dateControl.hasError('required')).toBe(true);

    dateControl.setValue('2026-02-30');
    expect(dateControl.hasError('dateFormat')).toBe(true);

    dateControl.setValue('not-a-date');
    expect(dateControl.hasError('dateFormat')).toBe(true);

    const today = component.maxObservationDate;
    dateControl.setValue(today);
    expect(dateControl.valid).toBe(true);

    dateControl.setValue('2000-01-01');
    expect(dateControl.valid).toBe(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateControl.setValue(
      [
        tomorrow.getFullYear(),
        String(tomorrow.getMonth() + 1).padStart(2, '0'),
        String(tomorrow.getDate()).padStart(2, '0'),
      ].join('-'),
    );
    expect(dateControl.hasError('futureDate')).toBe(true);
  });

  it('should require a location containing only letters, spaces and hyphens', () => {
    const locationControl = component.profileForm.controls.lieu;

    expect(locationControl.hasError('required')).toBe(true);

    locationControl.setValue('Saint-Étienne');
    expect(locationControl.valid).toBe(true);

    locationControl.setValue('   ');
    expect(locationControl.hasError('pattern')).toBe(true);

    locationControl.setValue('---');
    expect(locationControl.hasError('pattern')).toBe(true);

    for (const invalidLocation of ['Paris 5', 'Lyon!', 'Nice_']) {
      locationControl.setValue(invalidLocation);
      expect(locationControl.hasError('pattern')).toBe(true);
    }
  });

  it('should validate required latitude and longitude within geographic ranges', () => {
    const { latitude, longitude } = component.profileForm.controls;

    expect(latitude.hasError('required')).toBe(true);
    expect(longitude.hasError('required')).toBe(true);

    latitude.setValue(90);
    longitude.setValue(-180);
    expect(latitude.valid).toBe(true);
    expect(longitude.valid).toBe(true);

    latitude.setValue(-90);
    longitude.setValue(180);
    expect(latitude.valid).toBe(true);
    expect(longitude.valid).toBe(true);

    latitude.setValue(90.1);
    longitude.setValue(-180.1);
    expect(latitude.hasError('max')).toBe(true);
    expect(longitude.hasError('min')).toBe(true);

    latitude.setValue(Number.NaN);
    longitude.setValue(Number.POSITIVE_INFINITY);
    expect(latitude.hasError('number')).toBe(true);
    expect(longitude.hasError('number')).toBe(true);
  });

  it('should allow an empty photo URL and validate a supplied URL', () => {
    const photoUrlControl = component.profileForm.controls.photoUrl;

    expect(photoUrlControl.valid).toBe(true);

    photoUrlControl.setValue('https://example.com/photo.jpg');
    expect(photoUrlControl.valid).toBe(true);

    photoUrlControl.setValue('http://example.com/photo.jpg');
    expect(photoUrlControl.valid).toBe(true);

    for (const invalidUrl of ['not a URL', 'ftp://example.com/photo.jpg', 'https://']) {
      photoUrlControl.setValue(invalidUrl);
      expect(photoUrlControl.hasError('url')).toBe(true);
    }
  });

  it('should fill the coordinates from device geolocation', () => {
    const originalGeolocation = navigator.geolocation;
    const mockGeolocation = {
      getCurrentPosition: (success: PositionCallback) => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
            altitude: null,
            accuracy: 1,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        });
      },
    } as Geolocation;

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: mockGeolocation,
    });

    try {
      component.locateDevice();

      expect(component.profileForm.controls.latitude.value).toBe(48.8566);
      expect(component.profileForm.controls.longitude.value).toBe(2.3522);
      expect(component.isLocating).toBe(false);
      expect(component.locationErrorMessage).toBe('');
    } finally {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: originalGeolocation,
      });
    }
  });

  it('should render the six pollution type options', () => {
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll(
      'app-type-pollution option:not([value=""])',
    ) as NodeListOf<HTMLOptionElement>;

    expect(Array.from(options, (option) => option.textContent)).toEqual([
      'Plastique',
      'Chimique',
      'Dépôt sauvage',
      'Eau',
      'Air',
      'Autre',
    ]);
  });

  it('should update the reactive form when a pollution type is selected', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector(
      'app-type-pollution select',
    ) as HTMLSelectElement;

    select.value = 'Eau';
    select.dispatchEvent(new Event('change'));

    expect(component.profileForm.controls.typePollution.value).toBe('Eau');
    expect(component.profileForm.controls.typePollution.valid).toBe(true);
  });

  it('should enforce the pollution title length and allowed characters', () => {
    const titleControl = component.profileForm.controls.titreDeclarationDePollution;

    titleControl.setValue('AB');
    expect(titleControl.hasError('minlength')).toBe(true);

    titleControl.setValue('Été 2026');
    expect(titleControl.valid).toBe(true);

    titleControl.setValue('Code <script>');
    expect(titleControl.hasError('pattern')).toBe(true);

    titleControl.setValue('   ');
    expect(titleControl.hasError('pattern')).toBe(true);
  });

  it('should reflect form validity through the declaration button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    component.profileForm.controls.titreDeclarationDePollution.setValue('Pollution de la rivière');
    component.profileForm.controls.typePollution.setValue('Plastique');
    component.profileForm.controls.description.setValue('Description de la pollution');
    component.profileForm.controls.dateObservation.setValue(component.maxObservationDate);
    component.profileForm.controls.lieu.setValue('Paris');
    component.profileForm.controls.latitude.setValue(48.8566);
    component.profileForm.controls.longitude.setValue(2.3522);
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
  });

  it('should enable the declaration button only when the whole form is valid', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    component.profileForm.patchValue({
      titreDeclarationDePollution: 'Pollution de la rivière',
      typePollution: 'Plastique',
      description: 'Description de la pollution',
      dateObservation: component.maxObservationDate,
      lieu: 'Saint-Étienne',
      latitude: 45.4397,
      longitude: 4.3872,
    });
    fixture.detectChanges();

    expect(component.profileForm.valid).toBe(true);
    expect(button.disabled).toBe(false);

    component.profileForm.controls.photoUrl.setValue('URL invalide');
    fixture.detectChanges();

    expect(component.profileForm.invalid).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should render the form heading and coordinate inputs in a two-column row', () => {
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;
    const coordinateGrid = fixture.nativeElement.querySelector('.coordinates-grid') as HTMLElement;
    const labels = coordinateGrid.querySelectorAll('label');

    expect(heading.textContent).toContain('Déclarer une pollution');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('Latitude');
    expect(labels[1].textContent).toContain('Longitude');
    expect(fixture.nativeElement.querySelector('.field-hint')?.textContent).toContain(
      'Plastique',
    );
  });

  it('should replace the form with the recap after a valid submission', () => {
    fixture.detectChanges();
    component.profileForm.setValue({
      titreDeclarationDePollution: 'Pollution de la rivière',
      typePollution: 'Plastique',
      description: 'Description de la pollution',
      dateObservation: component.maxObservationDate,
      lieu: 'Saint-Étienne',
      latitude: 45.4397,
      longitude: 3.3872,
      photoUrl: 'https://example.com/photo.jpg',
    });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('app-recapitulatif-pollution-declaree'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Pollution de la rivière');
  });
});
