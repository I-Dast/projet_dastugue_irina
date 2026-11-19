import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Les composants d'écran sont chargés seulement quand leur route est visitée.
  { path: '', loadComponent: () => import('./components/signup/signup').then((m) => m.Signup) },
  { path: 'login', loadComponent: () => import('./components/login/login').then((m) => m.Login) },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin-users/admin-users').then((m) => m.AdminUsers),
    canActivate: [adminGuard],
  },
  {
    path: 'pollutions',
    loadComponent: () => import('./components/pollution-list/pollution-list').then((m) => m.PollutionList),
    canActivate: [authGuard],
  },
  {
    path: 'pollutions/new',
    loadComponent: () => import('./components/pollution-create/pollution-create').then((m) => m.PollutionCreate),
    canActivate: [authGuard],
  },
  // Étapes 4 et 5 : accès au détail par identifiant pour modifier ou supprimer.
  {
    path: 'pollutions/:id',
    loadComponent: () => import('./components/pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
    canActivate: [authGuard],
  },
  // Toute URL inconnue revient à l’accueil.
  { path: '**', redirectTo: '' },
];
