import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private mapLoaded = false;

  async loadGoogleMaps(): Promise<any> {
    if (this.mapLoaded) {
      return Promise.resolve(google.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.mapLoaded = true;
        resolve(google.maps);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Geocoding service for Kenya addresses
  async geocodeAddress(address: string): Promise<any> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      {
        address: address + ', Kenya',
        region: 'KE'
      },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(status);
        }
      }
    );
  });

  
}

   async createMapWithRoute(mapElement: HTMLElement, origin: string, destination: string) {
  await this.loadGoogleMaps();
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  const map = new google.maps.Map(mapElement, {
    zoom: 7,
    center: { lat: -1.286389, lng: 36.817223 }, // Nairobi as default center
  });

  directionsRenderer.setMap(map);

  directionsService.route(
    {
      origin: origin + ', Kenya',
      destination: destination + ', Kenya',
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
      } else {
        console.error('Directions request failed due to ', status);
      }
    }
  );
  }

}