import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check role-based access
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      if (!user || user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user?.role === 'CUSTOMER') {
          this.router.navigate(['/customer/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
        return false;
      }
    }

    return true;
  }
}

// Usage in your route configuration:
// {
//   path: 'admin/dashboard',
//   component: AdminDashboardComponent,
//   canActivate: [AuthGuard],
//   data: { role: 'ADMIN' }
// },
// {
//   path: 'customer/dashboard', 
//   component: CustomerDashboardComponent,
//   canActivate: [AuthGuard],
//   data: { role: 'CUSTOMER' }
// }