import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { CreateParcelComponent } from '../create-parcel/create-parcel.component';
import { ManageUsersComponent } from '../manage-users/manage-users.component';
import { ManageParcelComponent } from '../manage-parcel/manage-parcel.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    CreateParcelComponent,
    ManageParcelComponent,
    ManageUsersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit{
  totalParcels: number = 50;
  deliveredParcels: number = 25;
  pendingParcels: number = 25;
  totalUsers: number = 0;

  activePage: string = 'dashboard';

  sidebarItems = [
    { label: 'Dashboard', active: true, route: '/admin/dashboard' },
    { label: 'Create Parcel', active: false, route: '/admin/create-parcel' },
    { label: 'Manage Parcel', active: false, route: '/admin/manage-parcel' },
    { label: 'Manage Users', active: false, route: '/admin/users' }
  ];

  onSidebarItemClick(item: any): void {
    this.sidebarItems.forEach(sidebar => sidebar.active = false);
    item.active = true;

    switch (item.label) {
      case 'Dashboard':
        this.activePage = 'dashboard';
        break;
      case 'Create Parcel':
        this.activePage = 'create';
        break;
      case 'Manage Parcel':
        this.activePage = 'manage-parcel';
        break;
      case 'Manage Users':
        this.activePage = 'users';
        break;
    }
  }

  ngOnInit(): void {
    // Re-check localStorage to trigger navbar logic (if needed)
    const currentUser = JSON.parse(localStorage.getItem('sendit_current_user')!);
    if (!currentUser) {
      console.warn('No current user found in localStorage for admin.');
    }
  }
}
