import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { MyParcelsComponent } from '../my-parcels/my-parcels.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { AuthService } from '../../shared/services/auth.service';
import { ParcelService, Parcel } from '../../shared/services/parcel.service';


@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MyParcelsComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  customerName = 'User';
  totalParcels = 0;
  sentParcels = 0;
  receivedParcels = 0;
  pendingParcels = 0;
  parcels: Parcel[] = [];
  loading = true;
  error = '';



  constructor(
    private authService: AuthService,
    private parcelService: ParcelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    // Set customer name for welcome message
    this.customerName = currentUser.name || currentUser.email;

    // Test backend connectivity first
    this.testBackendConnection();
  }

  testBackendConnection() {
    // First test basic health
    this.parcelService.healthCheck().subscribe({
      next: (response) => {
        // If health check works, test parcels endpoint without auth
        this.testBackendNoAuth();
      },
      error: (err) => {
        console.error('Customer Dashboard - Health check failed:', err);
        this.error = 'Backend server not running';
        this.loading = false;
      }
    });
  }

  testBackendNoAuth() {
    this.parcelService.testBackendNoAuth().subscribe({
      next: (response) => {
        // If basic connectivity works, test with authentication
        this.testBackendWithAuth();
      },
      error: (err) => {
        console.error('Customer Dashboard - Backend test without auth failed:', err);
        this.error = 'Parcels endpoint not accessible';
        this.loading = false;
      }
    });
  }

  testBackendWithAuth() {
    this.parcelService.testBackend().subscribe({
      next: (response) => {
        // If auth test passes, load parcels
        this.loadParcels();
      },
      error: (err) => {
        console.error('Customer Dashboard - Backend test with auth failed:', err);
        this.error = 'Authentication failed';
        this.loading = false;
      }
    });
  }

  loadParcels() {
    this.loading = true;
    this.parcelService.getMyParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Customer Dashboard - Error loading parcels:', err);
        this.error = 'Failed to load parcels';
        this.loading = false;
      }
    });
  }

  calculateStats() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.totalParcels = this.parcels.length;
    this.sentParcels = this.parcels.filter(p => p.senderId === currentUser.id).length;
    this.receivedParcels = this.parcels.filter(p => p.receiverId === currentUser.id && p.status === 'DELIVERED').length;
    this.pendingParcels = this.parcels.filter(p => p.status === 'PENDING').length;
  }


}
