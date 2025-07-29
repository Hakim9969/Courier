import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourierService, Courier } from '../../../shared/services/courier.service';

@Component({
  selector: 'app-manage-couriers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-couriers.component.html',
  styleUrl: './manage-couriers.component.css'
})
export class ManageCouriersComponent implements OnInit {
  couriers: Courier[] = [];
  loading = true;
  error = '';
  
  // Create courier form
  showCreateForm = false;
  newCourier = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  isSubmitting = false;
  createError = '';

  // Search and filter
  searchText = '';
  filteredCouriers: Courier[] = [];

  constructor(private courierService: CourierService) {}

  ngOnInit(): void {
    this.loadCouriers();
  }

  loadCouriers() {
    this.loading = true;
    this.error = '';
    
    this.courierService.getAll().subscribe({
      next: (couriers) => {
        this.couriers = couriers;
        this.filterCouriers();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load couriers';
        this.loading = false;
        console.error('Error loading couriers:', err);
      }
    });
  }

  filterCouriers() {
    if (!this.searchText.trim()) {
      this.filteredCouriers = this.couriers;
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredCouriers = this.couriers.filter(courier =>
        courier.name.toLowerCase().includes(search) ||
        courier.email.toLowerCase().includes(search) ||
        courier.phone.includes(search)
      );
    }
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  resetCreateForm() {
    this.newCourier = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
    this.createError = '';
  }

  isFormValid(): boolean {
    return !!(
      this.newCourier.name &&
      this.newCourier.email &&
      this.newCourier.phone &&
      this.newCourier.password &&
      this.newCourier.confirmPassword &&
      this.newCourier.password.length >= 6 &&
      this.newCourier.password === this.newCourier.confirmPassword
    );
  }

  createCourier() {
    if (!this.isFormValid()) {
      this.createError = 'Please fill in all fields correctly and ensure passwords match';
      return;
    }

    this.isSubmitting = true;
    this.createError = '';

    const courierData = {
      name: this.newCourier.name,
      email: this.newCourier.email,
      phone: this.newCourier.phone,
      password: this.newCourier.password
    };

    this.courierService.create(courierData).subscribe({
      next: (response: Courier) => {
        console.log('Courier created successfully:', response);
        alert('Courier created successfully!');
        this.showCreateForm = false;
        this.resetCreateForm();
        this.loadCouriers(); // Reload the list
      },
      error: (err: any) => {
        console.error('Error creating courier:', err);
        this.createError = err.error?.message || 'Failed to create courier. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  updateCourierAvailability(courier: Courier) {
    this.courierService.updateAvailability(!courier.isAvailable).subscribe({
      next: (updatedCourier: Courier) => {
        // Update the courier in the local array
        const index = this.couriers.findIndex(c => c.id === courier.id);
        if (index !== -1) {
          this.couriers[index] = updatedCourier;
          this.filterCouriers();
        }
      },
      error: (err: any) => {
        console.error('Error updating courier availability:', err);
        alert('Failed to update courier availability');
      }
    });
  }

  deleteCourier(courierId: string) {
    if (confirm('Are you sure you want to delete this courier?')) {
      this.courierService.delete(courierId).subscribe({
        next: () => {
          alert('Courier deleted successfully!');
          this.loadCouriers(); // Reload the list
        },
        error: (err: any) => {
          console.error('Error deleting courier:', err);
          alert('Failed to delete courier');
        }
      });
    }
  }

  getStatusColor(isAvailable: boolean): string {
    return isAvailable ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  }
} 