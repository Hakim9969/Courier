import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { SentParcelsComponent } from '../sent-parcels/sent-parcels.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SentParcelsComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  customerName = 'User';
  totalParcels = 0;
  sentParcels = 0;
  receivedParcels = 0;
  pendingParcels = 0;

  ngOnInit(): void {
  const currentUser = JSON.parse(localStorage.getItem('sendit_current_user')!);
  if (!currentUser) {
    console.warn('No current user found in localStorage');
    return;
  }

  this.customerName = currentUser.name;

  const stored = localStorage.getItem('parcels');
  const parcels = stored ? JSON.parse(stored) : [];

  const userParcels = parcels.filter(
  (p: any) =>
    p.senderEmail === currentUser.email ||
    p.email === currentUser.email
);

this.totalParcels = userParcels.length;
this.sentParcels = parcels.filter((p: any) => p.senderEmail === currentUser.email).length;
this.receivedParcels = parcels.filter((p: any) => p.email === currentUser.email).length;
this.pendingParcels = userParcels.filter((p: any) => p.status === 'Pending').length;

 }

}
