import { Component, Input } from '@angular/core';
import { TypePollutionOption } from '../type-pollution/type-pollution';

export interface PollutionDeclaration {
  titreDeclarationDePollution: string;
  typePollution: TypePollutionOption;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}

@Component({
  imports: [],
  selector: 'app-recapitulatif-pollution-declaree',
  styleUrl: './recap.css',
  templateUrl: './recap.html',
})
export class RecapitulatifPollutionDeclaree {
  @Input({ required: true }) pollution!: PollutionDeclaration;

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }}
