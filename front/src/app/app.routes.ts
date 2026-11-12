import { Routes } from '@angular/router';
import { PollutionDetail } from './components/pollution-detail/pollution-detail';
import { PollutionCreate } from './components/pollution-create/pollution-create';
import { PollutionList } from './components/pollution-list/pollution-list';
import { Signup } from './components/signup/signup';

export const routes: Routes = [
  // L'inscription est l'accueil ; après création du compte, l'utilisateur arrive à la liste.
  { path: '', component: Signup },
  { path: 'pollutions', component: PollutionList },
  { path: 'pollutions/new', component: PollutionCreate },
  // Étapes 4 et 5 : accès au détail par identifiant pour modifier ou supprimer.
  { path: 'pollutions/:id', component: PollutionDetail },
  // Toute URL inconnue revient à l’accueil.
  { path: '**', redirectTo: '' },
];
