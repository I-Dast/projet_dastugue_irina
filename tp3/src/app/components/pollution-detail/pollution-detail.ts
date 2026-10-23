import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pollution, TypePollution, TYPES_POLLUTION } from '../../models/pollution';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionService } from '../../services/pollution.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-pollution-detail',
  styleUrl: './pollution-detail.css',
  templateUrl: './pollution-detail.html',
})
export class PollutionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly geolocationService = inject(GeolocationService);
  private readonly pollutionService = inject(PollutionService);

  readonly typesPollution = TYPES_POLLUTION;
  readonly pollution = signal<Pollution | null>(null);
  readonly isLoading = signal(true);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isLocating = signal(false);
  readonly errorMessage = signal('');
  readonly deleteErrorMessage = signal('');
  readonly locationErrorMessage = signal('');
  readonly saveErrorMessage = signal('');
  readonly saveSuccessMessage = signal('');
  readonly editForm = this.formBuilder.nonNullable.group({
    titreDeclarationDePollution: ['', [Validators.required, Validators.minLength(3)]],
    typePollution: this.formBuilder.nonNullable.control<TypePollution | ''>('', Validators.required),
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    dateObservation: ['', Validators.required],
    lieu: ['', Validators.required],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    photoUrl: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      this.errorMessage.set('Aucun identifiant de pollution n’a été fourni.');
      return;
    }

    this.pollutionService.getById(id).subscribe({
      next: (pollution) => {
        this.pollution.set(pollution);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error instanceof HttpErrorResponse && error.status === 404
            ? 'Cette pollution n’existe pas.'
            : error instanceof HttpErrorResponse
              ? `Impossible de charger le détail (erreur HTTP ${error.status}).`
              : 'Une erreur est survenue lors du chargement du détail.',
        );
      },
    });
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  startEditing(): void {
    const pollution = this.pollution();
    if (!pollution) {
      return;
    }

    this.editForm.patchValue({
      titreDeclarationDePollution: pollution.titreDeclarationDePollution,
      typePollution: pollution.typePollution,
      description: pollution.description,
      dateObservation: pollution.dateObservation,
      lieu: pollution.lieu,
      latitude: pollution.latitude,
      longitude: pollution.longitude,
      photoUrl: pollution.photoUrl,
    });
    this.saveErrorMessage.set('');
    this.saveSuccessMessage.set('');
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.saveErrorMessage.set('');
  }

  async locateDevice(): Promise<void> {
    this.isLocating.set(true);
    this.locationErrorMessage.set('');

    try {
      const position = await this.geolocationService.getCurrentPosition();
      this.editForm.patchValue(position);
      this.editForm.controls.latitude.markAsDirty();
      this.editForm.controls.longitude.markAsDirty();
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

  saveChanges(): void {
    const pollution = this.pollution();
    if (!pollution || pollution.id === undefined) {
      this.saveErrorMessage.set('Impossible de modifier cette pollution sans identifiant.');
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const typePollution = this.editForm.controls.typePollution.value;
    if (typePollution === '') {
      this.editForm.controls.typePollution.markAsTouched();
      return;
    }
    const pollutionData = { ...this.editForm.getRawValue(), typePollution };

    this.isSaving.set(true);
    this.saveErrorMessage.set('');
    this.saveSuccessMessage.set('');

    this.pollutionService.update(pollution.id, pollutionData).subscribe({
      next: (updatedPollution) => {
        this.pollution.set(updatedPollution);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.saveSuccessMessage.set('La pollution a été modifiée.');
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.saveErrorMessage.set(
          error instanceof HttpErrorResponse
            ? `Impossible de modifier la pollution (erreur HTTP ${error.status}).`
            : 'Une erreur est survenue lors de la modification de la pollution.',
        );
      },
    });
  }

  deletePollution(): void {
    const pollution = this.pollution();
    if (!pollution || pollution.id === undefined) {
      this.deleteErrorMessage.set('Impossible de supprimer cette pollution sans identifiant.');
      return;
    }

    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer la pollution « ${pollution.titreDeclarationDePollution} » ?`,
      )
    ) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteErrorMessage.set('');

    this.pollutionService.delete(pollution.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (error: unknown) => {
        this.isDeleting.set(false);
        this.deleteErrorMessage.set(
          error instanceof HttpErrorResponse
            ? `Impossible de supprimer la pollution (erreur HTTP ${error.status}).`
            : 'Une erreur est survenue lors de la suppression de la pollution.',
        );
      },
    });
  }
}
