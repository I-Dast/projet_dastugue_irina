import { Component, input, output } from '@angular/core';
import { Pollution } from '../../models/pollution';

@Component({
  // Le clic sur le fond ferme la fenêtre ; le clic dans le dialogue est intercepté par le template.
  host: {
    '(click)': 'close.emit()',
    role: 'presentation',
  },
  selector: 'app-pollution-recap',
  styleUrl: './pollution-recap.css',
  templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
  /** Données renvoyées par l’API après la création (elles incluent notamment l’id attribué). */
  readonly pollution = input.required<Pollution>();
  /** Événement envoyé au parent pour lui demander de fermer le récapitulatif. */
  readonly close = output<void>();

  /** Convertit la date API AAAA-MM-JJ en affichage français JJ/MM/AAAA. */
  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
