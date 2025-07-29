import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER' | 'COURIER';
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAvailabilityDto {
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CourierService {
  private baseUrl = 'http://localhost:3000/couriers';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all couriers (for admin use)
  getAll(): Observable<Courier[]> {
    return this.http.get<Courier[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  // Get current courier's profile
  getProfile(): Observable<Courier> {
    return this.http.get<Courier>(`${this.baseUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  // Update current courier's profile
  updateProfile(updateData: Partial<Courier>): Observable<Courier> {
    return this.http.patch<Courier>(`${this.baseUrl}/profile`, updateData, {
      headers: this.getHeaders()
    });
  }

  // Update courier availability
  updateAvailability(isAvailable: boolean): Observable<Courier> {
    return this.http.patch<Courier>(`${this.baseUrl}/availability`, { isAvailable }, {
      headers: this.getHeaders()
    });
  }

  // Get parcels assigned to current courier
  getAssignedParcels(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/parcels/assigned-parcels`, {
      headers: this.getHeaders()
    });
  }

  // Search couriers (for admin use)
  search(query: string): Observable<Courier[]> {
    return this.http.get<Courier[]>(`${this.baseUrl}/search?q=${query}`, {
      headers: this.getHeaders()
    });
  }

  // Create new courier (admin only)
  create(courierData: { name: string; email: string; phone: string; password: string }): Observable<Courier> {
    return this.http.post<Courier>(this.baseUrl, courierData, {
      headers: this.getHeaders()
    });
  }

  // Delete courier (admin only)
  delete(courierId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courierId}`, {
      headers: this.getHeaders()
    });
  }
} 