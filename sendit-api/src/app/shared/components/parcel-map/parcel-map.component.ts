import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var L: any;

export interface MapLocation {
  lat: number;
  lng: number;
  address: string;
}

@Component({
  selector: 'app-parcel-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="parcel-map-container">
      <div #mapContainer class="map-container"></div>
      <div *ngIf="loading" class="map-loading">
        <div class="loading-spinner"></div>
        <span>Loading map...</span>
      </div>
      <div *ngIf="error" class="map-error">
        <span>{{ error }}</span>
      </div>
    </div>
  `,
  styles: [`
    .parcel-map-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .map-container {
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .map-loading, .map-error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .map-error {
      color: #e74c3c;
    }
  `]
})
export class ParcelMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  @Input() pickupLocation!: MapLocation;
  @Input() destinationLocation!: MapLocation;
  @Input() height: string = '400px';
  
  private map: any;
  private pickupMarker: any;
  private destinationMarker: any;
  private routePolyline: any;
  
  loading = true;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Set custom height if provided
    if (this.height) {
      this.mapContainer.nativeElement.style.height = this.height;
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    try {
      // Initialize the map
      this.map = L.map(this.mapContainer.nativeElement).setView([-1.2921, 36.8219], 10); // Default to Nairobi

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Add markers and route if locations are provided
      if (this.pickupLocation && this.destinationLocation) {
        this.addMarkers();
        this.addRoute();
        this.fitMapToBounds();
      }

      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error initializing map:', err);
      this.error = 'Failed to load map';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private addMarkers(): void {
    // Add pickup marker
    this.pickupMarker = L.marker([this.pickupLocation.lat, this.pickupLocation.lng], {
      icon: L.divIcon({
        className: 'custom-marker pickup-marker',
        html: '<div style="background-color: #3498db; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(this.map);

    this.pickupMarker.bindPopup(`
      <div style="text-align: center;">
        <strong>Pickup Location</strong><br>
        ${this.pickupLocation.address}
      </div>
    `);

    // Add destination marker
    this.destinationMarker = L.marker([this.destinationLocation.lat, this.destinationLocation.lng], {
      icon: L.divIcon({
        className: 'custom-marker destination-marker',
        html: '<div style="background-color: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(this.map);

    this.destinationMarker.bindPopup(`
      <div style="text-align: center;">
        <strong>Destination</strong><br>
        ${this.destinationLocation.address}
      </div>
    `);
  }

  private addRoute(): void {
    // Create a simple straight line between pickup and destination
    // In a real application, you would use a routing service like OSRM or Google Directions API
    const routeCoordinates = [
      [this.pickupLocation.lat, this.pickupLocation.lng],
      [this.destinationLocation.lat, this.destinationLocation.lng]
    ];

    this.routePolyline = L.polyline(routeCoordinates, {
      color: '#2ecc71',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(this.map);

    // Add route popup
    this.routePolyline.bindPopup(`
      <div style="text-align: center;">
        <strong>Delivery Route</strong><br>
        Distance: ${this.calculateDistance()} km
      </div>
    `);
  }

  private fitMapToBounds(): void {
    const bounds = L.latLngBounds([
      [this.pickupLocation.lat, this.pickupLocation.lng],
      [this.destinationLocation.lat, this.destinationLocation.lng]
    ]);
    
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }

  private calculateDistance(): string {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = this.pickupLocation.lat * Math.PI / 180;
    const lat2 = this.destinationLocation.lat * Math.PI / 180;
    const deltaLat = (this.destinationLocation.lat - this.pickupLocation.lat) * Math.PI / 180;
    const deltaLng = (this.destinationLocation.lng - this.pickupLocation.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance.toFixed(1);
  }

  // Public method to update map with new locations
  updateMap(pickup: MapLocation, destination: MapLocation): void {
    this.pickupLocation = pickup;
    this.destinationLocation = destination;
    
    if (this.map) {
      // Clear existing markers and route
      if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
      if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
      if (this.routePolyline) this.map.removeLayer(this.routePolyline);
      
      // Add new markers and route
      this.addMarkers();
      this.addRoute();
      this.fitMapToBounds();
    }
  }
} 