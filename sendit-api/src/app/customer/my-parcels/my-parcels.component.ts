import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ParcelService, Parcel } from '../../shared/services/parcel.service';

@Component({
  selector: 'app-my-parcels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-parcels.component.html',
  styleUrls: ['./my-parcels.component.css']
})
export class MyParcelsComponent implements OnInit {

  parcels: Parcel[] = [];
  filteredParcels: Parcel[] = [];
  selectedParcel: Parcel | null = null;
  currentUser: any;
  searchText: string = '';
  searchStatus: string = '';
  loading = true;
  error = '';

  constructor(private router: Router, private authService: AuthService, private parcelService: ParcelService) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.parcels = [];
      this.filteredParcels = [];
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }
    
    this.currentUser = currentUser;
    this.loadParcels();
  }

  loadParcels() {
    this.loading = true;
    this.parcelService.getMyParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.filterParcels();
        this.loading = false;
      },
      error: (err) => {
        console.error('MyParcels - Error loading parcels:', err);
        this.error = 'Failed to load parcels';
        this.loading = false;
      }
    });
  }

  filterParcels() {
    const text = this.searchText.toLowerCase();
    this.filteredParcels = this.parcels.filter(parcel => {
      const matchesText =
        parcel.receiverName?.toLowerCase().includes(text) ||
        parcel.pickupAddress?.toLowerCase().includes(text) ||
        parcel.destination?.toLowerCase().includes(text) ||
        parcel.weightCategory?.toLowerCase().includes(text);
      const matchesStatus = this.searchStatus ? parcel.status === this.searchStatus : true;
      return matchesText && matchesStatus;
    });
  }

  toggleDetails(parcel: Parcel): void {
    if (this.selectedParcel?.id === parcel.id) {
      this.selectedParcel = null;
    } else {
      this.selectedParcel = parcel;
    }
  }

  trackParcel(parcel: Parcel): void {
    this.router.navigate(['/track-order', parcel.id]);
  }

  goToTrackOrder(parcel: Parcel): void {
    this.router.navigate(['/track-order', parcel.id]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
