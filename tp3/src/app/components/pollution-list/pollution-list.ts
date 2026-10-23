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
  // Services injectés par Angular : construction du formulaire, accès navigateur et appels API.
  private readonly formBuilder = inject(FormBuilder);
  private readonly geolocationService = inject(GeolocationService);
  private readonly pollutionService = inject(PollutionService);

  /** Étape 6 : liste commune des types utilisée par les filtres et le formulaire. */
  readonly typesPollution = TYPES_POLLUTION;
  readonly pollutions = signal<Pollution[]>([]);
  /** Étape 6 : valeurs des filtres ; une chaîne vide signifie « aucun filtre ». */
  readonly searchText = signal('');
  readonly typeFilter = signal<TypePollution | ''>('');
  readonly locationFilter = signal('');
  readonly dateFromFilter = signal('');
  readonly dateToFilter = signal('');
  /**
   * Étape 6 : résultat recalculé automatiquement quand les données ou un filtre change.
   * Tous les critères sont combinés (ET) ; les dates ISO se comparent directement.
   */
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
  /** Signaux d’état destinés aux indicateurs de chargement et aux messages dans le template. */
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

  /**
   * Formulaire de création (étape initiale du TP3).
   * Les validateurs empêchent l’envoi d’un titre trop court, d’une description hors limites
   * et de coordonnées en dehors des plages géographiques.
   */
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
    // Charge les enregistrements au premier affichage du composant.
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

  /**
   * Étape 6 : copie le texte du champ de recherche dans son signal.
   * event est l’événement DOM ; on vérifie sa cible avant de lire value,
   * car EventTarget n’est pas toujours un champ de saisie.
   */
  updateSearchText(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchText.set(event.target.value);
    }
  }

  /**
   * Étape 6 : ne conserve que les types autorisés.
   * event vient du select ; la garde permet de lire value sans cast.
   */
  updateTypeFilter(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const value = event.target.value;
      this.typeFilter.set(TYPES_POLLUTION.find((type) => type === value) ?? '');
    }
  }

  /**
   * Étape 6 : copie le lieu saisi ; sa comparaison sans distinction de casse
   * est effectuée dans filteredPollutions. event vient du champ de texte.
   */
  updateLocationFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.locationFilter.set(event.target.value);
    }
  }

  /**
   * Étape 6 : définit la borne de début inclusive. L’input date fournit une
   * chaîne AAAA-MM-JJ, ce qui permet une comparaison chronologique directe.
   */
  updateDateFromFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.dateFromFilter.set(event.target.value);
    }
  }

  /** Étape 6 : définit la borne de fin inclusive depuis le second input date. */
  updateDateToFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.dateToFilter.set(event.target.value);
    }
  }

  /** Étape 6 : efface les cinq critères et réaffiche la liste complète. */
  resetFilters(): void {
    this.searchText.set('');
    this.typeFilter.set('');
    this.locationFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
  }

  /** Reprise TP2 : demande la position et reporte latitude/longitude dans le formulaire de création. */
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

  /**
   * Crée une pollution (POST, étape initiale), puis met à jour la liste locale
   * et ouvre le récapitulatif seulement après la confirmation de l’API.
   */
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

  /** Ferme le récapitulatif (bouton, croix ou clic sur le fond). */
  closeRecap(): void {
    this.recapPollution.set(null);
  }

  /** Prépare une date ISO venant de l’API pour l’affichage français. */
  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Étape 5 : demande confirmation, lance DELETE, puis enlève localement la pollution
   * uniquement lorsque le serveur confirme la suppression.
   * pollution est l’enregistrement sélectionné depuis la liste.
   */
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
