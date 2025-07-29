import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateParcelDto {
  senderId: string;
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  destination: string;
  weightCategory: 'UNDER_1KG' | 'KG_1_TO_5' | 'KG_5_TO_10' | 'OVER_10KG';
  assignedCourierId?: string;
}

export interface UpdateParcelDto {
  senderId?: string;
  receiverId?: string;
  receiverName?: string;
  receiverPhone?: string;
  pickupAddress?: string;
  destination?: string;
  weightCategory?: 'UNDER_1KG' | 'KG_1_TO_5' | 'KG_5_TO_10' | 'OVER_10KG';
  assignedCourierId?: string;
  status?: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
}

export interface Parcel {
  id: string;
  senderId: string;
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  destination: string;
  weightCategory: string;
  status?: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedCourierId?: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private api = `${environment.apiUrl}/parcels`;

  constructor(private http: HttpClient) {}

  create(parcel: CreateParcelDto): Observable<Parcel> {
    return this.http.post<Parcel>(this.api, parcel);
  }

  getAll(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(this.api);
  }

  getById(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.api}/${id}`);
  }

  update(id: string, data: UpdateParcelDto): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  softDelete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  assignCourier(parcelId: string, courierId: string): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.api}/${parcelId}/assign-courier`, {
      courierId
    });
  }
}