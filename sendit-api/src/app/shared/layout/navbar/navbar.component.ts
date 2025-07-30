import { Component, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'COURIER';
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
  private routerSubscription: Subscription | null = null;
  currentRoute: string = '';
  showDropdown = false;
  showMobileMenu = false;

  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Check auth status on initialization
    this.checkAuthStatus();
    this.currentRoute = this.router.url;
    
    // Listen to router events to refresh auth state on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkAuthStatus();
        this.currentRoute = event.urlAfterRedirects || event.url;
        this.closeAllMenus(); // Close all menus on navigation
      });

    // Listen to storage events for cross-tab synchronization
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'token') {
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.isLoggedIn = true;
      } else {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  // Public method to refresh auth status (can be called from other components)
  refreshAuthStatus() {
    this.checkAuthStatus();
  }

  private clearAuthData() {
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

    let dashboardRoute = '/dashboard';
    
    if (this.currentUser.role === 'ADMIN') {
      dashboardRoute = '/admin/dashboard';
    } else if (this.currentUser.role === 'COURIER') {
      dashboardRoute = '/courier/dashboard';
    }
    
    this.router.navigate([dashboardRoute]);
  }

  logout() {
    this.authService.logout();
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  // Get display name for dashboard button
  getDashboardLabel(): string {
    if (!this.currentUser) return 'Dashboard';
    
    switch (this.currentUser.role) {
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'COURIER':
        return 'Courier Dashboard';
      default:
        return 'Dashboard';
    }
  }

  // Get user's first name for display
  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.name?.split(' ')[0] || this.currentUser.email; // Get first name or email
  }

  // Get dashboard route for routerLink
  getDashboardRoute(): string {
    if (!this.currentUser) return '/';
    
    switch (this.currentUser.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'COURIER':
        return '/courier/dashboard';
      default:
        return '/dashboard';
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  // Get user initials for the avatar
  getUserInitials(): string {
    if (!this.currentUser?.name) return this.currentUser?.email?.charAt(0).toUpperCase() || 'U';
    
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }

  // Toggle dropdown visibility
  toggleDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showDropdown = !this.showDropdown;
  }

  // Close dropdown
  closeDropdown() {
    this.showDropdown = false;
  }

  // Close all menus
  closeAllMenus() {
    this.closeDropdown();
    this.closeMobileMenu();
  }

  // Handle logout with dropdown close
  handleLogout() {
    this.closeDropdown();
    this.logout();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.user-dropdown');
    
    if (!dropdownContainer) {
      this.closeDropdown();
    }
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.closeDropdown(); // Close dropdown when opening mobile menu
    }
  }

  // Close mobile menu
  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  // Close mobile menu on navigation
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 768) { // md breakpoint
      this.closeMobileMenu();
    }
  }
}