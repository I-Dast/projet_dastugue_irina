import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TypePollution, TypePollutionOption } from '../type-pollution/type-pollution';
import { PollutionDeclaration, RecapitulatifPollutionDeclaree } from '../recap/recap';

function validateFiniteCoordinate(control: AbstractControl<number | null>): ValidationErrors | null {
  const value = control.value;
  return value === null || Number.isFinite(value) ? null : { number: true };
}

function validateOptionalPhotoUrl(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname
      ? null
      : { url: true };
  } catch {
    return { url: true };
  }
}

function validateObservationDate(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return { dateFormat: true };
  }

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return { dateFormat: true };
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  return value > today ? { futureDate: true } : null;
}

@Component({
  imports: [ReactiveFormsModule, TypePollution, RecapitulatifPollutionDeclaree],
  selector: 'app-formulaire-declarer-une-pollution',
  styleUrl: './formulaire-declarer-une-pollution.css',
  templateUrl: './formulaire-declarer-une-pollution.html',
})
export class FormulaireDeclarerUnePollution {
  private readonly formBuilder = inject(FormBuilder);

  declarationData: PollutionDeclaration | null = null;

  profileForm = this.formBuilder.nonNullable.group({
    titreDeclarationDePollution: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^(?=.*[\p{L}\p{N}])[\p{L}\p{N} ]+$/u),
      ],
    ],
    typePollution: this.formBuilder.nonNullable.control<TypePollutionOption | ''>(
      '',
      Validators.required,
    ),
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
        Validators.pattern(/^(?!\s*$)[^<>§$]+$/u),
      ],
    ],
    dateObservation: ['', [Validators.required, validateObservationDate]],
    lieu: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*\p{L})[\p{L} -]+$/u),
      ],
    ],
    latitude: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(-90),
      Validators.max(90),
      validateFiniteCoordinate,
    ]),
    longitude: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(-180),
      Validators.max(180),
      validateFiniteCoordinate,
    ]),
    photoUrl: ['', validateOptionalPhotoUrl],
  });

  readonly maxObservationDate = this.getLocalDateValue(new Date());
  isLocating = false;
  locationErrorMessage = '';

  submitDeclaration(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();
    if (
      formValue.typePollution === '' ||
      formValue.latitude === null ||
      formValue.longitude === null
    ) {
      throw new Error('Le formulaire valide contient des données requises manquantes.');
    }

    this.declarationData = {
      ...formValue,
      typePollution: formValue.typePollution,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
    };
  }

  locateDevice(): void {
    this.locationErrorMessage = '';
    if (!navigator.geolocation) {
      this.locationErrorMessage = 'La géolocalisation n’est pas disponible sur cet appareil.';
      return;
    }

    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.profileForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.profileForm.controls.latitude.markAsDirty();
        this.profileForm.controls.longitude.markAsDirty();
        this.isLocating = false;
      },
      (error) => {
        this.locationErrorMessage = this.getLocationErrorMessage(error.code);
        this.isLocating = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  private getLocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'L’accès à la position a été refusé. Autorisez la géolocalisation dans votre navigateur.';
      case 2:
        return 'La position de l’appareil est indisponible.';
      case 3:
        return 'La demande de géolocalisation a expiré. Réessayez.';
      default:
        return 'Une erreur est survenue lors de la géolocalisation.';
    }
  }

  private getLocalDateValue(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
