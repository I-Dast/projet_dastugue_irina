import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pollution, TypePollution, TYPES_POLLUTION } from '../../models/pollution';
import { PollutionService } from '../../services/pollution.service';

@Component({
  imports: [RouterLink],
  selector: 'app-pollution-list',
  styleUrl: './pollution-list.css',
  templateUrl: './pollution-list.html',
})
export class PollutionList implements OnInit {
  // Le composant liste se limite au chargement, au filtrage et à la suppression.
  private readonly pollutionService = inject(PollutionService);

  /** Liste des types proposée dans le filtre. */
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
  readonly isDeleting = signal(false);
  readonly listErrorMessage = signal('');
  readonly deleteErrorMessage = signal('');
  readonly deleteSuccessMessage = signal('');

  ngOnInit(): void {
    // Charge les enregistrements au premier affichage du composant.
    this.pollutionService.list().subscribe({
      next: (pollutions) => {
        this.pollutions.set(pollutions);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.listErrorMessage.set(this.pollutionService.getErrorMessage(error));
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
        this.deleteErrorMessage.set(this.pollutionService.getErrorMessage(error));
      },
    });
  }
}
