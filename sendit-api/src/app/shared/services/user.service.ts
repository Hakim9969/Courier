// src/app/shared/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'COURIER';
  profileImage?: string;
  createdAt?: string;
  deletedAt?: Date | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api, {
      headers: this.getHeaders()
    });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`, {
      headers: this.getHeaders()
    });
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.api}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/search?q=${query}`, {
      headers: this.getHeaders()
    });
  }

  updateRole(id: string, newRole: 'CUSTOMER' | 'ADMIN'): Observable<User> {
    return this.update(id, { role: newRole });
  }

  softDelete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
