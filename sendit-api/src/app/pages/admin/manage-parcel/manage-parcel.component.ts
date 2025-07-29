import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Parcel, ParcelService, UpdateParcelDto } from '../../../shared/services/parcel.service';
import { CourierService, Courier } from '../../../shared/services/courier.service';
import { UserService, User } from '../../../shared/services/user.service';

@Component({
  selector: 'app-manage-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-parcel.component.html',
  styleUrl: './manage-parcel.component.css'
})
export class ManageParcelComponent implements OnInit {
  parcels: Parcel[] = [];
  filteredParcels: Parcel[] = [];
  selectedParcel: Parcel | null = null;
  searchText = '';
  searchStatus = '';
  loading = false;
  error = '';
  availableCouriers: Courier[] = [];
  receiverSuggestions: User[] = [];
  showReceiverSuggestions = false;
  statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(
    private router: Router, 
    private parcelService: ParcelService,
    private courierService: CourierService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadParcels();
    this.loadCouriers();
  }

  loadParcels() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getAll().subscribe({
      next: (data: Parcel[]) => {
        this.parcels = data;
        this.filterParcels();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch parcels', err);
        this.error = 'Failed to load parcels. Please try again.';
        this.loading = false;
      }
    });
  }

  loadCouriers() {
    this.courierService.getAll().subscribe({
      next: (couriers: Courier[]) => {
        this.availableCouriers = couriers;
      },
      error: (err: any) => {
        console.error('Failed to fetch couriers', err);
      }
    });
  }

  searchReceivers(event: any) {
    const query = event.target.value.trim();
    if (query.length < 2) {
      this.receiverSuggestions = [];
      return;
    }

    this.userService.searchUsers(query).subscribe({
      next: (users: User[]) => {
        this.receiverSuggestions = users.filter(user => user.role === 'CUSTOMER');
        this.showReceiverSuggestions = true;
      },
      error: (err: any) => {
        console.error('Failed to search users', err);
        this.receiverSuggestions = [];
      }
    });
  }

  selectReceiver(user: User) {
    this.selectedParcel!.receiverName = user.name;
    this.selectedParcel!.receiverPhone = user.phone;
    this.receiverSuggestions = [];
    this.showReceiverSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    // Close suggestions when clicking outside
    if (!event.target.closest('.parcel-detail-box')) {
      this.showReceiverSuggestions = false;
    }
  }

  // Alternative method name for template compatibility
  fetchParcels() {
    this.loadParcels();
  }

  getStatusClasses(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  updateStatus(id: string, newStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'): void {
    const updateData: UpdateParcelDto = { status: newStatus };
    this.parcelService.update(id, updateData).subscribe({
      next: (updatedParcel) => {
        // Update the local parcel data instead of reloading everything
        const parcelIndex = this.parcels.findIndex(p => p.id === id);
        if (parcelIndex !== -1) {
          this.parcels[parcelIndex] = { ...this.parcels[parcelIndex], ...updatedParcel };
          this.filterParcels();
        }
      },
      error: (err: any) => {
        console.error('Update failed', err);
        alert('Failed to update status. Please try again.');
      }
    });
  }

  // Method for template compatibility
  updateParcelStatus(id: string, newStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'): void {
    this.updateStatus(id, newStatus);
  }

  deleteParcel(id: string) {
    if (!confirm('Are you sure you want to delete this parcel?')) return;

    this.parcelService.delete(id).subscribe({
      next: (response) => {
        this.selectedParcel = null;
        // Remove from local arrays instead of reloading
        this.parcels = this.parcels.filter(p => p.id !== id);
        this.filterParcels();
        alert('Parcel deleted successfully!');
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        alert('Failed to delete parcel. Please try again.');
      }
    });
  }

  toggleDetails(parcel: Parcel) {
    this.selectedParcel = this.selectedParcel?.id === parcel.id ? null : parcel;
  }

  editParcel(parcel: Parcel) {
    this.selectedParcel = { ...parcel }; // Create a copy to avoid direct modification
  }

  filterParcels() {
    const text = this.searchText.toLowerCase();
    this.filteredParcels = this.parcels.filter(parcel => {
      const matchesText =
        parcel.receiverName?.toLowerCase().includes(text) ||
        parcel.destination?.toLowerCase().includes(text) ||
        parcel.pickupAddress?.toLowerCase().includes(text) ||
        parcel.receiverPhone?.toLowerCase().includes(text);
      const matchesStatus = this.searchStatus ? parcel.status === this.searchStatus : true;
      return matchesText && matchesStatus;
    });
  }

  goToTrackOrder(parcel?: Parcel) {
    if (parcel?.id) {
      this.router.navigate(['/track-order', parcel.id]);
    } else {
      this.router.navigate(['/track-order']);
    }
  }

  saveParcelEdit(parcel: Parcel) {
    const updateData: UpdateParcelDto = {
      receiverName: parcel.receiverName,
      receiverPhone: parcel.receiverPhone,
      pickupAddress: parcel.pickupAddress,
      destination: parcel.destination,
      weightCategory: parcel.weightCategory,
      status: parcel.status,
      assignedCourierId: parcel.assignedCourierId
    };

    this.parcelService.update(parcel.id, updateData).subscribe({
      next: (updatedParcel) => {
        alert('Parcel updated successfully!');
        // Update local data instead of reloading
        const parcelIndex = this.parcels.findIndex(p => p.id === parcel.id);
        if (parcelIndex !== -1) {
          this.parcels[parcelIndex] = { ...this.parcels[parcelIndex], ...updatedParcel };
          this.filterParcels();
        }
        this.selectedParcel = null;
      },
      error: (err: any) => {
        console.error('Failed to update parcel', err);
        alert(err?.error?.message || 'Failed to update parcel.');
      }
    });
  }

  // Helper method to get available status options
  getStatusOptions(): Array<{value: string, label: string}> {
    return this.statusOptions;
  }

  // Helper method to format status for display
  formatStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'IN_TRANSIT': return 'In Transit';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  // Helper method to format weight category for display
  formatWeightCategory(weight: string): string {
    switch (weight) {
      case 'LIGHT': return 'Light';
      case 'MEDIUM': return 'Medium';
      case 'HEAVY': return 'Heavy';
      default: return weight;
    }
  }
}