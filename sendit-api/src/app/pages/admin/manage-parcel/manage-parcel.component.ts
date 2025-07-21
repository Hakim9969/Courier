import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Add this
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Include FormsModule
  templateUrl: './manage-parcel.component.html',
  styleUrl: './manage-parcel.component.css'
})
export class ManageParcelComponent {
  parcels: any[] = [];
  filteredParcels: any[] = [];
  selectedParcel: any | null = null;
  searchText: string = '';
  searchStatus: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const stored = localStorage.getItem('parcels');
    this.parcels = stored ? JSON.parse(stored) : [];
    this.filterParcels();
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
    const updatedParcels = this.parcels.map(parcel => {
      if (parcel.id === id) {
        return { ...parcel, status: newStatus };
      }
      return parcel;
    });

    this.parcels = updatedParcels;
    localStorage.setItem('parcels', JSON.stringify(this.parcels));
    this.filterParcels();
  }

  filterParcels() {
    const text = this.searchText.toLowerCase();
    this.filteredParcels = this.parcels.filter(parcel => {
      const matchesText =
        parcel.description?.toLowerCase().includes(text) ||
        parcel.deliveryAddress?.toLowerCase().includes(text) ||
        parcel.weight?.toLowerCase().includes(text);
      const matchesStatus = this.searchStatus ? parcel.status === this.searchStatus : true;
      return matchesText && matchesStatus;
    });
  }

  toggleDetails(parcel: any): void {
    if (this.selectedParcel?.id === parcel.id) {
      this.selectedParcel = null;
    } else {
      this.selectedParcel = parcel;
    }
  }

  goToTrackOrder() {
    this.router.navigate(['/track-order']);
  }

  saveParcelEdit(parcel: any) {
    // Update the parcel in the array
    const idx = this.parcels.findIndex((p) => p.id === parcel.id);
    if (idx !== -1) {
      this.parcels[idx] = { ...parcel };
      localStorage.setItem('parcels', JSON.stringify(this.parcels));
      this.filterParcels();
      alert('Parcel updated successfully!');
    }
  }
}
