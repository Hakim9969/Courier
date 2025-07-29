import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/layout/navbar/navbar.component';
import { CreateParcelComponent } from '../create-parcel/create-parcel.component';
import { ManageUsersComponent } from '../manage-users/manage-users.component';
import { ManageParcelComponent } from '../manage-parcel/manage-parcel.component';
import { ManageCouriersComponent } from '../manage-couriers/manage-couriers.component';
import { AuthService } from '../../../shared/services/auth.service';
import { ParcelService, Parcel } from '../../../shared/services/parcel.service';
import { UserService, User } from '../../../shared/services/user.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    CreateParcelComponent,
    ManageParcelComponent,
    ManageUsersComponent,
    ManageCouriersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalParcels = 0;
  deliveredParcels = 0;
  pendingParcels = 0;
  totalUsers = 0;
  adminName: string = 'Admin';

  parcels: Parcel[] = [];
  users: User[] = [];
  loading = true;
  error = '';

  pendingParcelsList: Parcel[] = [];
  filteredPendingParcels: Parcel[] = [];
  selectedPendingParcel: Parcel | null = null;
  searchText: string = '';
  searchStatus: string = '';

  activePage: string = 'dashboard';

  sidebarItems = [
    { label: 'Dashboard', icon: '📊', active: true, route: '/admin/dashboard' },
    { label: 'Create Parcel', icon: '➕', active: false, route: '/admin/create-parcel' },
    { label: 'Manage Parcel', icon: '📦', active: false, route: '/admin/manage-parcel' },
    { label: 'Manage Users', icon: '👤', active: false, route: '/admin/users' },
    { label: 'Manage Couriers', icon: '🚚', active: false, route: '/admin/manage-couriers' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private parcelService: ParcelService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'No current user found for admin dashboard.';
      this.loading = false;
      return;
    } else {
      this.adminName = currentUser.name || currentUser.email;
    }
    
    // Check for section query parameter
    this.route.queryParams.subscribe(params => {
      if (params['section'] === 'manage-parcel') {
        this.activePage = 'manage-parcel';
        // Update sidebar to show Manage Parcel as active
        this.sidebarItems.forEach(item => {
          item.active = item.label === 'Manage Parcel';
        });
      }
    });
    
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
    Promise.all([
      this.parcelService.getAllParcels().toPromise(),
      this.userService.getAll().toPromise()
    ]).then(([parcels, users]) => {
      this.parcels = parcels || [];
      this.users = users || [];
      this.calculateStats();
      this.loading = false;
    }).catch(err => {
      this.error = 'Failed to load dashboard data.';
      this.loading = false;
      console.error('Admin dashboard load error:', err);
    });
  }

  calculateStats() {
    this.totalParcels = this.parcels.length;
    this.deliveredParcels = this.parcels.filter(p => p.status === 'DELIVERED').length;
    this.pendingParcels = this.parcels.filter(p => p.status === 'PENDING').length;
    this.totalUsers = this.users.length;
    this.pendingParcelsList = this.parcels.filter(p => p.status === 'PENDING');
    this.filterPendingParcels();
  }

  filterPendingParcels() {
    const text = this.searchText.toLowerCase();
    this.filteredPendingParcels = this.pendingParcelsList.filter(parcel => {
      const matchesText =
        parcel.receiverName?.toLowerCase().includes(text) ||
        parcel.pickupAddress?.toLowerCase().includes(text) ||
        parcel.destination?.toLowerCase().includes(text) ||
        parcel.weightCategory?.toLowerCase().includes(text);
      const matchesStatus = this.searchStatus ? parcel.status === this.searchStatus : true;
      return matchesText && matchesStatus;
    });
  }

  onSidebarItemClick(item: any): void {
    this.sidebarItems.forEach(sidebar => sidebar.active = false);
    item.active = true;
    switch (item.label) {
      case 'Dashboard':
        this.activePage = 'dashboard';
        break;
      case 'Create Parcel':
        this.activePage = 'create';
        break;
      case 'Manage Parcel':
        this.activePage = 'manage-parcel';
        break;
      case 'Manage Users':
        this.activePage = 'users';
        break;
      case 'Manage Couriers':
        this.activePage = 'manage-couriers';
        break;
    }
  }

  viewParcelDetails(parcel: Parcel) {
    this.selectedPendingParcel = parcel;
  }

  closePendingParcelDetails() {
    this.selectedPendingParcel = null;
  }

  goToTrackOrder(parcel?: Parcel) {
    if (parcel && parcel.id) {
      this.router.navigate(['/track-order', parcel.id]);
    } else {
      this.router.navigate(['/track-order']);
    }
  }

  getStatusClasses(status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'): string {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  updateParcelStatus(id: string, newStatus: string): void {
    // This would call an API to update the parcel status in a real app
    const idx = this.parcels.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.parcels[idx] = { ...this.parcels[idx], status: newStatus as Parcel['status'] };
      this.calculateStats();
    }
  }

  toggleDetails(parcel: Parcel): void {
    if (this.selectedPendingParcel?.id === parcel.id) {
      this.selectedPendingParcel = null;
    } else {
      this.selectedPendingParcel = parcel;
    }
  }

  deleteParcel(parcelId: string) {
    this.parcels = this.parcels.filter(p => p.id !== parcelId);
    this.calculateStats();
    if (this.selectedPendingParcel?.id === parcelId) {
      this.selectedPendingParcel = null;
    }
  }
}
