import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

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
