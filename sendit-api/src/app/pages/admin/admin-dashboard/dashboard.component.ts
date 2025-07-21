import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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

  pendingParcelsList: any[] = [];
  filteredPendingParcels: any[] = [];
  selectedPendingParcel: any | null = null;
  searchText: string = '';
  searchStatus: string = '';

  activePage: string = 'dashboard';

  sidebarItems = [
    { label: 'Dashboard', icon: '📊', active: true, route: '/admin/dashboard' },
    { label: 'Create Parcel', icon: '➕', active: false, route: '/admin/create-parcel' },
    { label: 'Manage Parcel', icon: '📦', active: false, route: '/admin/manage-parcel' },
    { label: 'Manage Users', icon: '👤', active: false, route: '/admin/users' }
  ];

  constructor(private router: Router) {}

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

  viewParcelDetails(parcel: any) {
    this.selectedPendingParcel = parcel;
  }

  closePendingParcelDetails() {
    this.selectedPendingParcel = null;
  }

  goToTrackOrder(parcel?: any) {
    if (parcel && parcel.id) {
      this.router.navigate(['/track-order', parcel.id]);
    } else {
      this.router.navigate(['/track-order']);
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Published':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  updateParcelStatus(id: string, newStatus: string): void {
    const updatedParcels = this.pendingParcelsList.map(parcel => {
      if (parcel.id === id) {
        return { ...parcel, status: newStatus };
      }
      return parcel;
    });
    this.pendingParcelsList = updatedParcels;
    // Update in localStorage as well
    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedAll = allParcels.map((p: any) => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('parcels', JSON.stringify(updatedAll));
    this.filterPendingParcels();
  }

  filterPendingParcels() {
    const text = this.searchText.toLowerCase();
    this.filteredPendingParcels = this.pendingParcelsList.filter(parcel => {
      const matchesText =
        parcel.description?.toLowerCase().includes(text) ||
        parcel.deliveryAddress?.toLowerCase().includes(text) ||
        parcel.weight?.toLowerCase().includes(text);
      const matchesStatus = this.searchStatus ? parcel.status === this.searchStatus : true;
      return matchesText && matchesStatus;
    });
  }

  toggleDetails(parcel: any): void {
    if (this.selectedPendingParcel?.id === parcel.id) {
      this.selectedPendingParcel = null;
    } else {
      this.selectedPendingParcel = parcel;
    }
  }

  saveParcelEdit(parcel: any) {
    // Update the parcel in the array
    const idx = this.pendingParcelsList.findIndex((p) => p.id === parcel.id);
    if (idx !== -1) {
      this.pendingParcelsList[idx] = { ...parcel };
      // Update in localStorage as well
      const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
      const updatedAll = allParcels.map((p: any) => p.id === parcel.id ? { ...parcel } : p);
      localStorage.setItem('parcels', JSON.stringify(updatedAll));
      this.filterPendingParcels();
      alert('Parcel updated successfully!');
    }
  }

  deleteParcel(parcelId: string) {
    // Remove from pendingParcelsList
    this.pendingParcelsList = this.pendingParcelsList.filter(p => p.id !== parcelId);
    // Remove from all parcels in localStorage
    const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    const updatedAll = allParcels.filter((p: any) => p.id !== parcelId);
    localStorage.setItem('parcels', JSON.stringify(updatedAll));
    this.filterPendingParcels();
    // If the deleted parcel was selected, close details
    if (this.selectedPendingParcel?.id === parcelId) {
      this.selectedPendingParcel = null;
    }
  }

  ngOnInit(): void {
    // Re-check localStorage to trigger navbar logic (if needed)
    const currentUser = JSON.parse(localStorage.getItem('sendit_current_user')!);
    if (!currentUser) {
      console.warn('No current user found in localStorage for admin.');
    }
    // Load pending parcels
    const stored = localStorage.getItem('parcels');
    const allParcels = stored ? JSON.parse(stored) : [];
    this.pendingParcelsList = allParcels.filter((p: any) => p.status === 'Pending');
    this.filterPendingParcels();
  }
}
