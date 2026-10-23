import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  /**
   * Reprise de la géolocalisation du TP2 pour le TP final.
   * La promesse ne réussit qu’avec les deux coordonnées ; les refus et délais
   * dépassés sont convertis en erreurs compréhensibles par le composant appelant.
   */
  getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    if (!navigator.geolocation) {
      return Promise.reject(
        new Error('La géolocalisation n’est pas disponible sur cet appareil.'),
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => reject(new Error(this.getErrorMessage(error.code))),
        // Demande une position précise, attend au plus 10 secondes et ne réutilise pas un résultat en cache.
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  /**
   * Convertit les codes d’erreur standard du navigateur en messages destinés à l’utilisateur.
   * code correspond à PositionError.code fourni par l’API Geolocation.
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'L’accès à la position a été refusé. Autorisez la géolocalisation dans votre navigateur.';
      case 2:
        return 'La position de l’appareil est indisponible.';
      case 3:
        return 'La demande de géolocalisation a expiré. Réessayez.';
      default:
        return 'Une erreur est survenue lors de la géolocalisation.';
    }
  }
}
