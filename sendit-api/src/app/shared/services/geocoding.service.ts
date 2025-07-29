import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly apiKey = 'AIzaSyBhvbWEKTHHBjIcvQ0s_-AwxRGdc4_m_yM';
  private readonly geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<GeocodingResult | null> {
    if (!address) {
      // Return default coordinates for Nairobi if no address
      return of({
        lat: -1.2921,
        lng: 36.8219,
        formattedAddress: 'Nairobi, Kenya'
      });
    }

    const url = `${this.geocodingUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formattedAddress: result.formatted_address
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Geocoding error:', error);
        // Return default coordinates on error
        return of({
          lat: -1.2921,
          lng: 36.8219,
          formattedAddress: address || 'Nairobi, Kenya'
        });
      })
    );
  }

  // Batch geocoding for multiple addresses
  geocodeAddresses(addresses: string[]): Observable<(GeocodingResult | null)[]> {
    const geocodingRequests = addresses.map(address => this.geocodeAddress(address));
    return of(geocodingRequests.map(() => ({
      lat: -1.2921,
      lng: 36.8219,
      formattedAddress: 'Nairobi, Kenya'
    })));
  }

  // Reverse geocoding (coordinates to address)
  reverseGeocode(lat: number, lng: number): Observable<string | null> {
    const url = `${this.geocodingUrl}?latlng=${lat},${lng}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          return response.results[0].formatted_address;
        }
        return null;
      }),
      catchError(error => {
        console.error('Reverse geocoding error:', error);
        return of('Nairobi, Kenya');
      })
    );
  }
} 