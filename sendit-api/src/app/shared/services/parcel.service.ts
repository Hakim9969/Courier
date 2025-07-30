import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CreateParcelDto {
  senderId: string;
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  destination: string;
  weightCategory: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  assignedCourierId?: string;
}

export interface UpdateParcelDto {
  receiverName?: string;
  receiverPhone?: string;
  pickupAddress?: string;
  destination?: string;
  weightCategory?: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedCourierId?: string;
}

export interface Parcel {
  id: string;
  senderId: string;
  receiverId: string;
  assignedCourierId?: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  weightCategory: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
  assignedCourier?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private baseUrl = 'http://localhost:3000/parcels';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  create(parcel: CreateParcelDto): Observable<Parcel> {
    console.log('ParcelService - Creating parcel with payload:', parcel);
    console.log('ParcelService - Using headers:', this.getHeaders());
    return this.http.post<Parcel>(this.baseUrl, parcel, {
      headers: this.getHeaders()
    });
  }

  getMyParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.baseUrl}/my-parcels`, {
      headers: this.getHeaders()
    });
  }

  testBackend(): Observable<string> {
    return this.http.get(`${this.baseUrl}/test`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  testBackendNoAuth(): Observable<string> {
    return this.http.get(`${this.baseUrl}/test`, { responseType: 'text' });
  }

  healthCheck(): Observable<string> {
    return this.http.get('http://localhost:3000/health', { responseType: 'text' });
  }

  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  // Alias for getAllParcels for component compatibility
  getAll(): Observable<Parcel[]> {
    return this.getAllParcels();
  }

  getParcelById(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  update(id: string, updateData: UpdateParcelDto): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.baseUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    });
  }

  updateParcelStatusByCourier(id: string, status: string): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.baseUrl}/update-status/${id}`, { status }, {
      headers: this.getHeaders()
    });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
} 