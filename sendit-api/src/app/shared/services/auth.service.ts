import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER' | 'COURIER';
    name: string;
  };
}

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'COURIER';
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  register(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phoneNumber,
    }).pipe(
      tap(res => this.handleAuth(res)),
      catchError(err => throwError(() => err.error?.message || 'Registration failed'))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, {
      email,
      password,
    }).pipe(
      tap(res => this.handleAuth(res)),
      catchError(err => throwError(() => err.error?.message || 'Login failed'))
    );
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem('token', res.access_token);
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    // First try to get user from localStorage (set during login/register)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        // If parsing fails, fall back to JWT decoding
      }
    }

    // Fallback: decode JWT token
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name
      };
      
      return user;
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }
}
