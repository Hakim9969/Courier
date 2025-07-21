import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { CustomerGuard } from './guards/customer.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  {
    path: 'customer/dashboard',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () =>
      import('./customer/customer-dashboard/dashboard.component').then((m) => m.CustomerDashboardComponent),
  },

  
  {
    path: 'customer/sent',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () =>
      import('./customer/my-parcels/my-parcels.component').then(m => m.MyParcelsComponent),
  },
  

  {
    path: 'track-order',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () => import('./pages/track-order/track-order.component').then(m => m.TrackOrderComponent)
  },

  {
    path: 'track-order/:id',
    canActivate: [AuthGuard, CustomerGuard],
    loadComponent: () => import('./pages/track-order/track-order.component').then(m => m.TrackOrderComponent)
  },

  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },

  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent)
  },


  // ADMIN ROUTES
  { path: 'admin/dashboard',canActivate: [AuthGuard], loadComponent: () => import('./pages/admin/admin-dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'admin/create-parcel',canActivate: [AuthGuard, AdminGuard], loadComponent: () => import('./pages/admin/create-parcel/create-parcel.component').then(m => m.CreateParcelComponent) },
  { path: 'admin/manage-parcels',canActivate: [AuthGuard, AdminGuard], loadComponent: () => import('./pages/admin/manage-parcel/manage-parcel.component').then(m => m.ManageParcelComponent) },
  { path: 'admin/users',canActivate: [AuthGuard, AdminGuard], loadComponent: () => import('./pages/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent) },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
