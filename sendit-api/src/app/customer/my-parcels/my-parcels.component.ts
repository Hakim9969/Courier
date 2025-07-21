import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-parcels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-parcels.component.html',
  styleUrls: ['./my-parcels.component.css']
})
export class MyParcelsComponent {
  parcels: any[] = [];
  filteredParcels: any[] = [];
  selectedParcel: any | null = null;
  currentUser: any;
  searchText: string = '';
  searchStatus: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
  const user = localStorage.getItem('sendit_current_user');
  if (!user) {
    this.parcels = [];
      this.filteredParcels = [];
    return;
  }
  this.currentUser = JSON.parse(user);
  const stored = localStorage.getItem('parcels');
  const allParcels = stored ? JSON.parse(stored) : [];
  this.parcels = allParcels.filter(
  (p: any) =>
    p.senderEmail === this.currentUser.email ||
    p.email === this.currentUser.email
);
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

  goToTrackOrder(parcel?: any) {
    if (parcel && parcel.id) {
      this.router.navigate(['/track-order', parcel.id]);
    } else {
    this.router.navigate(['/track-order']);
    }
  }

  toggleDetails(parcel: any): void {
    if (this.selectedParcel?.id === parcel.id) {
      this.selectedParcel = null;
    } else {
      this.selectedParcel = parcel;
    }
  }
}
