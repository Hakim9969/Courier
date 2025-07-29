import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { CustomerGuard } from './guards/customer.guard';
import { AdminGuard } from './guards/admin.guard';
import { CourierGuard } from './guards/courier.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'terms', loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'track-order', loadComponent: () => import('./pages/track-order/track-order.component').then(m => m.TrackOrderComponent) },
  { path: 'track-order/:id', loadComponent: () => import('./pages/track-order/track-order.component').then(m => m.TrackOrderComponent) },
  { path: 'not-found', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
  
  // Customer routes
  {
    path: 'dashboard',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () => import('./customer/customer-dashboard/dashboard.component').then(m => m.CustomerDashboardComponent)
  },
  {
    path: 'my-parcels',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () => import('./customer/my-parcels/my-parcels.component').then(m => m.MyParcelsComponent)
  },
  
  // Admin routes
  {
    path: 'admin/dashboard',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./pages/admin/admin-dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/create-parcel',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./pages/admin/create-parcel/create-parcel.component').then(m => m.CreateParcelComponent)
  },
  {
    path: 'admin/manage-parcel',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./pages/admin/manage-parcel/manage-parcel.component').then(m => m.ManageParcelComponent)
  },
  {
    path: 'admin/manage-users',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./pages/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent)
  },
  
  // Courier routes
  {
    path: 'courier/dashboard',
    canActivate: [AuthGuard, CourierGuard],
    loadComponent: () => import('./courier/courier-dashboard/courier-dashboard.component').then(m => m.CourierDashboardComponent)
  },
  
  { path: '**', redirectTo: '/not-found' }
];
