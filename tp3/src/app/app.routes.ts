import { Routes } from '@angular/router';
import { PollutionDetail } from './components/pollution-detail/pollution-detail';
import { PollutionList } from './components/pollution-list/pollution-list';

export const routes: Routes = [
  { path: '', component: PollutionList },
  { path: 'pollutions/:id', component: PollutionDetail },
  { path: '**', redirectTo: '' },
];
