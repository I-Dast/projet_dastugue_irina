import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pollutionLevel',
  standalone: true,
})
export class PollutionLevelPipe implements PipeTransform {
  transform(indice: number | undefined): string {
    if (indice === undefined || !Number.isFinite(indice) || indice < 0) {
      return 'Inconnu';
    }

    if (indice <= 20) {
      return 'Faible';
    }
    if (indice <= 50) {
      return 'Modérée';
    }
    if (indice <= 100) {
      return 'Élevée';
    }
    return 'Dangereuse';
  }
}
