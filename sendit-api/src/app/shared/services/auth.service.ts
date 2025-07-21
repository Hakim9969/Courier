import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor(private router: Router) {
    // Load from localStorage if available
    const savedUsers = localStorage.getItem('sendit_users');
    if (savedUsers) this.users = JSON.parse(savedUsers);

    const savedCurrentUser = localStorage.getItem('sendit_current_user');
    if (savedCurrentUser) {
      try {
        this.currentUser = JSON.parse(savedCurrentUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        this.clearStoredAuth();
      }
    }
  }

  private generateShortId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('sendit_current_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.currentUser = null;
  }

  register(user: { 
    name: string; 
    phoneNumber: string; 
    email: string; 
    password: string; 
    role: 'ADMIN' | 'CUSTOMER' 
  }): boolean {
    const savedUsers = localStorage.getItem('sendit_users');
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

    const exists = users.find(u => u.email === user.email);
    if (exists) throw new Error('User already exists');

    const newUser: User = {
      ...user,
      id: this.generateShortId(),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    users.push(newUser);
    localStorage.setItem('sendit_users', JSON.stringify(users));
    this.users = users;
    
    return true;
  }

  login(email: string, password: string): User {
    const savedUsers = localStorage.getItem('sendit_users');
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');

    this.currentUser = user;
    
    // Store user info with consistent key names
    localStorage.setItem('sendit_current_user', JSON.stringify(user));
    localStorage.setItem('token', 'mock-jwt-token-' + user.id);
    localStorage.setItem('role', user.role);

    return user;
  }

  logout(): void {
    this.clearStoredAuth();
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    // Always check localStorage for most recent data
    const savedUser = localStorage.getItem('sendit_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing current user:', error);
        this.clearStoredAuth();
      }
    }
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('sendit_current_user');
    return !!(token && user);
  }

  hasRole(role: 'ADMIN' | 'CUSTOMER'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}