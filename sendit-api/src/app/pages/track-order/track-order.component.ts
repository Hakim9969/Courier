import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ParcelService, Parcel } from '../../shared/services/parcel.service';
import { GeocodingService } from '../../shared/services/geocoding.service';
import { ParcelMapComponent, MapLocation } from '../../shared/components/parcel-map/parcel-map.component';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FooterComponent, NavbarComponent, ParcelMapComponent],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.css'
})
export class TrackOrderComponent implements AfterViewInit{
  parcel: Parcel | null = null;
  loading = true;
  error = '';
  mapLoading = false;
  pickupLocation: MapLocation | null = null;
  destinationLocation: MapLocation | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private authService: AuthService,
    private parcelService: ParcelService,
    private geocodingService: GeocodingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Load parcel by ID from backend
        this.loadParcelById(id);
      } else {
        // Load first pending parcel for current user
        this.loadFirstPendingParcel();
      }
    });
  }

  loadParcelById(id: string) {
    this.parcelService.getParcelById(id).subscribe({
      next: (parcel) => {
        this.parcel = parcel;
        this.loading = false;
        this.loadMapCoordinates();
      },
      error: (err) => {
        console.error('Error loading parcel:', err);
        this.error = 'Failed to load parcel';
        this.loading = false;
      }
    });
  }

  loadFirstPendingParcel() {
    this.parcelService.getMyParcels().subscribe({
      next: (parcels) => {
        const pendingParcel = parcels.find(p => p.status === 'PENDING');
        if (pendingParcel) {
          this.parcel = pendingParcel;
          this.loadMapCoordinates();
        } else {
          this.error = 'No pending parcels found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading parcels:', err);
        this.error = 'Failed to load parcels';
        this.loading = false;
      }
    });
  }

  loadMapCoordinates() {
    if (!this.parcel) return;

    this.mapLoading = true;
    
    // Geocode both addresses to get coordinates
    Promise.all([
      this.geocodingService.geocodeAddress(this.parcel.pickupAddress).toPromise(),
      this.geocodingService.geocodeAddress(this.parcel.destination).toPromise()
    ]).then(([pickupResult, destinationResult]) => {
      if (pickupResult && destinationResult) {
        this.pickupLocation = {
          lat: pickupResult.lat,
          lng: pickupResult.lng,
          address: pickupResult.formattedAddress
        };
        
        this.destinationLocation = {
          lat: destinationResult.lat,
          lng: destinationResult.lng,
          address: destinationResult.formattedAddress
        };
      } else {
        console.error('Failed to geocode addresses');
        this.error = 'Failed to load map coordinates';
      }
      this.mapLoading = false;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Error geocoding addresses:', err);
      this.error = 'Failed to load map coordinates';
      this.mapLoading = false;
      this.cdr.detectChanges();
    });
  }


  goToDashboard() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    if (currentUser.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard'], { queryParams: { section: 'manage-parcel' } });
    } else if (currentUser.role === 'CUSTOMER') {
      this.router.navigate(['/dashboard']);
    } else {
      // For couriers or other roles
      this.router.navigate(['/courier/dashboard']);
    }
  }

  getDashboardButtonLabel(): string {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return 'Go to Dashboard';
    
    return currentUser.role === 'ADMIN' ? 'Go to Manage Parcels' : 'Go to My Parcels';
  }
  ngAfterViewInit(): void {
  }
}
