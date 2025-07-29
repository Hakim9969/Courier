import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { AuthService } from '../../shared/services/auth.service';
import { CourierService, Courier } from '../../shared/services/courier.service';
import { ParcelService, Parcel } from '../../shared/services/parcel.service';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './courier-dashboard.component.html',
  styleUrls: ['./courier-dashboard.component.css']
})
export class CourierDashboardComponent implements OnInit {
  courierName = 'Courier';
  totalAssignedParcels = 0;
  pendingParcels = 0;
  inTransitParcels = 0;
  deliveredParcels = 0;
  assignedParcels: Parcel[] = [];
  loading = true;
  error = '';
  isAvailable = true;
  updatingAvailability = false;

  constructor(
    private authService: AuthService,
    private courierService: CourierService,
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

    // Set courier name for welcome message
    this.courierName = currentUser.name || currentUser.email;

    // Load courier data
    this.loadCourierData();
  }

  loadCourierData() {
    this.loading = true;
    
    // Load courier profile first to get current availability
    this.courierService.getProfile().subscribe({
      next: (courier) => {
        this.isAvailable = courier.isAvailable;
        
        // Then load assigned parcels
        this.courierService.getAssignedParcels().subscribe({
          next: (parcels) => {
            this.assignedParcels = parcels;
            this.calculateStats();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Courier Dashboard - Error loading assigned parcels:', err);
            this.error = 'Failed to load assigned parcels';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Courier Dashboard - Error loading courier profile:', err);
        this.error = 'Failed to load courier profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateStats() {
    this.totalAssignedParcels = this.assignedParcels.length;
    this.pendingParcels = this.assignedParcels.filter(p => p.status === 'PENDING').length;
    this.inTransitParcels = this.assignedParcels.filter(p => p.status === 'IN_TRANSIT').length;
    this.deliveredParcels = this.assignedParcels.filter(p => p.status === 'DELIVERED').length;
  }

  updateAvailability() {
    this.updatingAvailability = true;
    // Send the opposite of current state since user is toggling
    const newAvailability = !this.isAvailable;
    this.courierService.updateAvailability(newAvailability).subscribe({
      next: (courier) => {
        this.isAvailable = courier.isAvailable;
        this.updatingAvailability = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Courier Dashboard - Error updating availability:', err);
        this.error = 'Failed to update availability';
        this.updatingAvailability = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateParcelStatus(parcelId: string, newStatus: string) {
    this.parcelService.updateParcelStatusByCourier(parcelId, newStatus).subscribe({
      next: (updatedParcel) => {
        // Update local parcel data
        const index = this.assignedParcels.findIndex(p => p.id === parcelId);
        if (index !== -1) {
          this.assignedParcels[index] = updatedParcel;
          this.calculateStats();
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Courier Dashboard - Error updating parcel status:', err);
        this.error = 'Failed to update parcel status';
        this.cdr.detectChanges();
      }
    });
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

  getStatusOptions(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDING':
        return ['IN_TRANSIT', 'CANCELLED'];
      case 'IN_TRANSIT':
        return ['DELIVERED', 'CANCELLED'];
      case 'DELIVERED':
        return [];
      case 'CANCELLED':
        return ['PENDING']; // Allow reactivating cancelled parcels
      default:
        return ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    }
  }
} 