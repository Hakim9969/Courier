import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Check auth status on initialization
    this.checkAuthStatus();
    
    // Listen to router events to refresh auth state on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthStatus();
      });

    // Also listen to storage events for cross-tab synchronization
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'sendit_current_user' || event.key === 'token') {
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('sendit_current_user');

    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        // Map the role from backend format to frontend format
        this.currentUser = {
          ...user,
          role: user.role?.toLowerCase() === 'admin' ? 'admin' : 'customer'
        };
        this.isLoggedIn = true;
      } catch (error) {
        console.error('Error parsing user info:', error);
        this.clearAuthData();
      }
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('sendit_current_user'); // ✅ Fixed key name
    localStorage.removeItem('role');
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  openLogin() {
    this.loginClick.emit();
  }

  openRegister() {
    this.registerClick.emit();
  }

  navigateToDashboard() {
    if (!this.currentUser) return;

    const dashboardRoute = this.currentUser.role === 'admin' 
      ? '/admin/dashboard' 
      : '/customer/dashboard';
    
    this.router.navigate([dashboardRoute]);
  }

  logout() {
    // Clear auth token/session and user info
    this.clearAuthData();
    
    // Redirect to home page
    this.router.navigate(['/']);
  }

  // Method to be called after successful login (from parent component)
  onLoginSuccess(user: User, token: string) {
    this.currentUser = {
      ...user,
      role: user.role?.toLowerCase() === 'admin' ? 'admin' : 'customer'
    };
    this.isLoggedIn = true;
    
    // Store user info and token
    localStorage.setItem('token', token);
    localStorage.setItem('sendit_current_user', JSON.stringify(user));
  }

  // Get display name for dashboard button
  getDashboardLabel(): string {
    return this.currentUser?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';
  }

  // Get user's first name for display
  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.name.split(' ')[0]; // Get first name only
  }
}