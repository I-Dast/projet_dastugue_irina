import { Component, input, output } from '@angular/core';
import { Pollution } from '../../models/pollution';

@Component({
  host: {
    '(click)': 'close.emit()',
    role: 'presentation',
  },
  selector: 'app-pollution-recap',
  styleUrl: './pollution-recap.css',
  templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
  readonly pollution = input.required<Pollution>();
  readonly close = output<void>();

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
