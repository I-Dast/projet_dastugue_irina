import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { HighlightPollutionDirective } from '../../directives/highlight-pollution.directive';
import { Pollution, TypePollution, TYPES_POLLUTION } from '../../models/pollution';
import { PollutionLevelPipe } from '../../pipes/pollution-level.pipe';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionService } from '../../services/pollution.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HighlightPollutionDirective,
    PollutionLevelPipe,
    PollutionRecap,
    ReactiveFormsModule,
    RouterLink,
  ],
  selector: 'app-pollution-create',
  styleUrl: './pollution-create.css',
  templateUrl: './pollution-create.html',
})
export class PollutionCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly geolocationService = inject(GeolocationService);
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);

  readonly typesPollution = TYPES_POLLUTION;
  readonly pollutionForm = this.formBuilder.nonNullable.group({
    titreDeclarationDePollution: ['', [Validators.required, Validators.minLength(3)]],
    typePollution: this.formBuilder.nonNullable.control<TypePollution | ''>('', Validators.required),
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    dateObservation: ['', Validators.required],
    lieu: ['', Validators.required],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    photoUrl: [''],
    indiceDangerosite: this.formBuilder.control<number | null>(null, Validators.min(0)),
  });

  readonly isSaving = signal(false);
  readonly isLocating = signal(false);
  readonly errorMessage = signal('');
  readonly locationErrorMessage = signal('');
  readonly recapPollution = signal<Pollution | null>(null);

  updateDangerIndex(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.pollutionForm.controls.indiceDangerosite.setValue(event.target.valueAsNumber);
    }
  }

  // Remplit les coordonnées avec la position autorisée par le navigateur.
  async locateDevice(): Promise<void> {
    this.isLocating.set(true);
    this.locationErrorMessage.set('');

    try {
      const position = await this.geolocationService.getCurrentPosition();
      this.pollutionForm.patchValue(position);
      this.pollutionForm.controls.latitude.markAsDirty();
      this.pollutionForm.controls.longitude.markAsDirty();
    } catch (error: unknown) {
      this.locationErrorMessage.set(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la géolocalisation.',
      );
    } finally {
      this.isLocating.set(false);
    }
  }

  // Envoie la déclaration et revient à la liste seulement après une création confirmée.
  addPollution(): void {
    if (this.pollutionForm.invalid || this.isSaving()) {
      this.pollutionForm.markAllAsTouched();
      return;
    }

    const typePollution = this.pollutionForm.controls.typePollution.value;
    if (typePollution === '') {
      this.pollutionForm.controls.typePollution.markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.pollutionService
      .create({ ...this.pollutionForm.getRawValue(), typePollution })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (pollution) => {
          this.recapPollution.set(pollution);
        },
        error: (error: unknown) => {
          const message =
            error instanceof HttpErrorResponse ? error.error?.message : null;
          this.errorMessage.set(
            typeof message === 'string'
              ? message
              : this.pollutionService.getErrorMessage(error),
          );
        },
      });
  }

  // Ferme le récapitulatif puis revient à la liste actualisée par l’API.
  closeRecap(): void {
    this.recapPollution.set(null);
    void this.router.navigateByUrl('/pollutions');
  }
}
