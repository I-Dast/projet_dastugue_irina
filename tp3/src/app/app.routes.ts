import { Routes } from '@angular/router';
import { PollutionDetail } from './components/pollution-detail/pollution-detail';
import { PollutionList } from './components/pollution-list/pollution-list';

export const routes: Routes = [
  // Page principale : formulaire de déclaration et liste avec filtres (étape 6).
  { path: '', component: PollutionList },
  // Étapes 4 et 5 : accès au détail par identifiant pour modifier ou supprimer.
  { path: 'pollutions/:id', component: PollutionDetail },
  // Toute URL inconnue revient à l’accueil.
  { path: '**', redirectTo: '' },
];
