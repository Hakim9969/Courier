import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsService } from '../../shared/services/google-maps';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FooterComponent, NavbarComponent],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.css'
})
export class TrackOrderComponent implements AfterViewInit{
  parcel: any = null;
  @ViewChild('mapContainer') mapElementRef!: ElementRef;

  constructor(private route: ActivatedRoute, private router: Router, private googleMapsService: GoogleMapsService) {}

  ngOnInit() {
    const user = localStorage.getItem('sendit_current_user');
    if (!user) return;
    const currentUser = JSON.parse(user);
    const stored = localStorage.getItem('parcels');
    const allParcels = stored ? JSON.parse(stored) : [];

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Find parcel by ID
        this.parcel = allParcels.find((p: any) => String(p.id) === String(id));
      } else {
        // Find first pending parcel for current user
        this.parcel = allParcels.find((p: any) =>
          (p.senderEmail === currentUser.email || p.email === currentUser.email) && p.status === 'Pending'
        );
      }
      setTimeout(() => this.loadMap(), 500);
    });
  }

  async loadMap() {
    if (this.parcel?.pickupLocation && this.parcel?.deliveryAddress && this.mapElementRef) {
      try {
        await this.googleMapsService.createMapWithRoute(
          this.mapElementRef.nativeElement,
          this.parcel.pickupLocation,
          this.parcel.deliveryAddress
        );
      } catch (err) {
        console.error('Error loading map:', err);
      }
    }
  }


  goToDashboard() {
    const user = localStorage.getItem('sendit_current_user');
    if (!user) return;
    const currentUser = JSON.parse(user);
    if (currentUser.role === 'ADMIN') {
      this.router.navigate(['/admin/manage-parcel']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  getDashboardButtonLabel(): string {
    const user = localStorage.getItem('sendit_current_user');
    if (!user) return 'Go to Dashboard';
    const currentUser = JSON.parse(user);
    return currentUser.role === 'ADMIN' ? 'Go to Manage Parcels' : 'Go to My Parcels';
  }
  ngAfterViewInit(): void {
  }
}
