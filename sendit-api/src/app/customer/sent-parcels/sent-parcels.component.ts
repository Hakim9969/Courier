import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sent-parcels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent-parcels.component.html',
  styleUrls: ['./sent-parcels.component.css']
})
export class SentParcelsComponent {
  parcels: any[] = [];
  selectedParcel: any | null = null;
  currentUser: any;

  constructor(private router: Router) {}

  ngOnInit() {
  const user = localStorage.getItem('sendit_current_user');
  console.log('Current User from localStorage:', user);
  if (!user) {
    this.parcels = [];
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
}

  goToTrackOrder() {
    this.router.navigate(['/track-order']);
  }

  toggleDetails(parcel: any): void {
    if (this.selectedParcel?.id === parcel.id) {
      this.selectedParcel = null;
    } else {
      this.selectedParcel = parcel;
    }
  }
}
