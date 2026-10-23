import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { Pollution, TypePollution, TYPES_POLLUTION } from '../../models/pollution';
import { GeolocationService } from '../../services/geolocation.service';
import { PollutionService } from '../../services/pollution.service';

@Component({
  imports: [PollutionRecap, ReactiveFormsModule, RouterLink],
  selector: 'app-pollution-list',
  styleUrl: './pollution-list.css',
  templateUrl: './pollution-list.html',
})
export class PollutionList implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly geolocationService = inject(GeolocationService);
  private readonly pollutionService = inject(PollutionService);

  readonly typesPollution = TYPES_POLLUTION;
  readonly pollutions = signal<Pollution[]>([]);
  readonly searchText = signal('');
  readonly typeFilter = signal<TypePollution | ''>('');
  readonly locationFilter = signal('');
  readonly dateFromFilter = signal('');
  readonly dateToFilter = signal('');
  readonly filteredPollutions = computed(() => {
    const search = this.searchText().trim().toLocaleLowerCase();
    const type = this.typeFilter();
    const location = this.locationFilter().trim().toLocaleLowerCase();
    const dateFrom = this.dateFromFilter();
    const dateTo = this.dateToFilter();

    return this.pollutions().filter((pollution) => {
      const matchesSearch =
        !search ||
        `${pollution.titreDeclarationDePollution} ${pollution.description}`
          .toLocaleLowerCase()
          .includes(search);

      return (
        matchesSearch &&
        (!type || pollution.typePollution === type) &&
        (!location || pollution.lieu.toLocaleLowerCase().includes(location)) &&
        (!dateFrom || pollution.dateObservation >= dateFrom) &&
        (!dateTo || pollution.dateObservation <= dateTo)
      );
    });
  });
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isLocating = signal(false);
  readonly locationErrorMessage = signal('');
  readonly recapPollution = signal<Pollution | null>(null);
  readonly listErrorMessage = signal('');
  readonly deleteErrorMessage = signal('');
  readonly deleteSuccessMessage = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly pollutionForm = this.formBuilder.nonNullable.group({
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
    this.pollutionService.list().subscribe({
      next: (pollutions) => {
        this.pollutions.set(pollutions);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.listErrorMessage.set(
          error instanceof HttpErrorResponse
            ? `Impossible de charger les pollutions (erreur HTTP ${error.status}).`
            : 'Une erreur est survenue lors du chargement des pollutions.',
        );
      },
    });
  }

  updateSearchText(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchText.set(event.target.value);
    }
  }

  updateTypeFilter(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const value = event.target.value;
      this.typeFilter.set(TYPES_POLLUTION.find((type) => type === value) ?? '');
    }
  }

  updateLocationFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.locationFilter.set(event.target.value);
    }
  }

  updateDateFromFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.dateFromFilter.set(event.target.value);
    }
  }

  updateDateToFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.dateToFilter.set(event.target.value);
    }
  }

  resetFilters(): void {
    this.searchText.set('');
    this.typeFilter.set('');
    this.locationFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
  }

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

  addPollution(): void {
    if (this.pollutionForm.invalid) {
      this.pollutionForm.markAllAsTouched();
      return;
    }

    const typePollution = this.pollutionForm.controls.typePollution.value;
    if (typePollution === '') {
      this.pollutionForm.controls.typePollution.markAsTouched();
      return;
    }
    const pollutionData = { ...this.pollutionForm.getRawValue(), typePollution };

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.recapPollution.set(null);

    this.pollutionService.create(pollutionData).subscribe({
      next: (pollution) => {
        this.pollutions.update((current) => [pollution, ...current]);
        this.pollutionForm.reset();
        this.isSaving.set(false);
        this.successMessage.set('La pollution a été ajoutée.');
        this.recapPollution.set(pollution);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          error instanceof HttpErrorResponse
            ? `Impossible d’ajouter la pollution (erreur HTTP ${error.status}).`
            : 'Une erreur est survenue lors de l’ajout de la pollution.',
        );
      },
    });
  }

  closeRecap(): void {
    this.recapPollution.set(null);
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  deletePollution(pollution: Pollution): void {
    if (pollution.id === undefined) {
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
    this.deleteSuccessMessage.set('');

    this.pollutionService.delete(pollution.id).subscribe({
      next: () => {
        this.pollutions.update((current) => current.filter((item) => item.id !== pollution.id));
        this.isDeleting.set(false);
        this.deleteSuccessMessage.set('La pollution a été supprimée.');
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
