import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, UserService } from '../../../shared/services/user.service';
import { Courier, CourierService } from '../../../shared/services/courier.service';
import { ParcelService, CreateParcelDto, Parcel } from '../../../shared/services/parcel.service';

declare var google: any;

@Component({
  selector: 'app-create-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-parcel.component.html',
  styleUrl: './create-parcel.component.css'
})
export class CreateParcelComponent implements OnInit, AfterViewInit {
  parcel = {
    senderId: '',
    receiverId: '',
    receiverName: '',
    receiverPhone: '',
    pickupAddress: '',
    destination: '',
    weightCategory: '' as 'LIGHT' | 'MEDIUM' | 'HEAVY' | '',
    assignedCourierId: ''
  };

  // Customer users for dropdowns
  customers: User[] = [];
  
  // Couriers for dropdown
  couriers: Courier[] = [];
  
  // Display fields for selected users and courier
  selectedSender: User | null = null;
  selectedReceiver: User | null = null;
  selectedCourier: Courier | null = null;
  
  // Loading states
  isLoadingCustomers = false;
  isLoadingCouriers = false;
  isSubmitting = false;
  
  // Error handling
  error = '';
  
  // Google Places Autocomplete
  pickupAutocomplete: any;
  destinationAutocomplete: any;
  
  // User search autocomplete
  filteredSenders: User[] = [];
  filteredReceivers: User[] = [];
  filteredCouriers: Courier[] = [];
  
  // Search terms
  senderSearchTerm = '';
  receiverSearchTerm = '';
  courierSearchTerm = '';
  
  // Show/hide dropdowns
  showSenderDropdown = false;
  showReceiverDropdown = false;
  showCourierDropdown = false;
  
  // Weight categories matching backend enum
  weightCategories = [
    { value: 'LIGHT', label: 'Light (0-1 kg)' },
    { value: 'MEDIUM', label: 'Medium (1-5 kg)' },
    { value: 'HEAVY', label: 'Heavy (5+ kg)' }
  ];

  constructor(
    private userService: UserService,
    private courierService: CourierService,
    private parcelService: ParcelService
  ) {}

  ngOnInit(): void {
    // Load all customers for dropdowns
    this.loadCustomers();
    
    // Load all couriers for dropdown
    this.loadCouriers();
  }

  ngAfterViewInit(): void {
    // Wait a bit for the DOM to be fully ready
    setTimeout(() => {
      this.initializeAutocomplete();
    }, 100);
  }

  initializeAutocomplete(): void {
    try {
      // Check if Google Maps API is loaded
      if (typeof google === 'undefined') {
        console.error('Google Maps API not loaded - google object is undefined');
        return;
      }
      
      if (!google.maps) {
        console.error('Google Maps API not loaded - google.maps is undefined');
        return;
      }
      
      if (!google.maps.places) {
        console.error('Google Places API not loaded - google.maps.places is undefined');
        return;
      }

      console.log('Google Maps API loaded successfully');

      // Initialize pickup address autocomplete
      const pickupInput = document.getElementById('pickupAddress') as HTMLInputElement;
      if (pickupInput) {
        console.log('Initializing pickup address autocomplete');
        this.pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
          types: ['address'],
          componentRestrictions: { country: 'KE' }, // Restrict to Kenya
          fields: ['formatted_address', 'geometry', 'name']
        });
        
        this.pickupAutocomplete.addListener('place_changed', () => {
          const place = this.pickupAutocomplete.getPlace();
          console.log('Pickup place selected:', place);
          if (place.geometry && place.formatted_address) {
            this.parcel.pickupAddress = place.formatted_address;
            console.log('Pickup location selected:', place.formatted_address);
            console.log('Pickup coordinates:', place.geometry.location.lat(), place.geometry.location.lng());
          } else {
            console.warn('Pickup place selected but no geometry or formatted_address');
          }
        });
        
        console.log('Pickup autocomplete initialized successfully');
      } else {
        console.error('Pickup address input not found');
      }

      // Initialize destination address autocomplete
      const destinationInput = document.getElementById('destination') as HTMLInputElement;
      if (destinationInput) {
        console.log('Initializing destination address autocomplete');
        this.destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
          types: ['address'],
          componentRestrictions: { country: 'KE' }, // Restrict to Kenya
          fields: ['formatted_address', 'geometry', 'name']
        });
        
        this.destinationAutocomplete.addListener('place_changed', () => {
          const place = this.destinationAutocomplete.getPlace();
          console.log('Destination place selected:', place);
          if (place.geometry && place.formatted_address) {
            this.parcel.destination = place.formatted_address;
            console.log('Destination selected:', place.formatted_address);
            console.log('Destination coordinates:', place.geometry.location.lat(), place.geometry.location.lng());
          } else {
            console.warn('Destination place selected but no geometry or formatted_address');
          }
        });
        
        console.log('Destination autocomplete initialized successfully');
      } else {
        console.error('Destination input not found');
      }

      console.log('Google Places Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }

  loadCustomers() {
    this.isLoadingCustomers = true;
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        // Filter only CUSTOMER users
        this.customers = users.filter(user => user.role === 'CUSTOMER');
        this.isLoadingCustomers = false;
      },
      error: (err: any) => {
        console.error('Error loading customers:', err);
        this.error = 'Failed to load customers';
        this.isLoadingCustomers = false;
      }
    });
  }

  loadCouriers() {
    this.isLoadingCouriers = true;
    this.courierService.getAll().subscribe({
      next: (couriers: Courier[]) => {
        this.couriers = couriers;
        this.isLoadingCouriers = false;
      },
      error: (err: any) => {
        console.error('Error loading couriers:', err);
        this.error = 'Failed to load couriers';
        this.isLoadingCouriers = false;
      }
    });
  }

  // Sender selection from dropdown
  onSenderChange(event: Event): void {
    const senderId = (event.target as HTMLSelectElement).value;
    if (senderId) {
      this.selectedSender = this.customers.find(c => c.id === senderId) || null;
      this.parcel.senderId = senderId;
    } else {
      this.selectedSender = null;
      this.parcel.senderId = '';
    }
  }

  // Receiver selection from dropdown
  onReceiverChange(event: Event): void {
    const receiverId = (event.target as HTMLSelectElement).value;
    if (receiverId) {
      this.selectedReceiver = this.customers.find(c => c.id === receiverId) || null;
      this.parcel.receiverId = receiverId;
      // Auto-fill receiver name and phone
      if (this.selectedReceiver) {
        this.parcel.receiverName = this.selectedReceiver.name;
        this.parcel.receiverPhone = this.selectedReceiver.phone || '';
      }
    } else {
      this.selectedReceiver = null;
      this.parcel.receiverId = '';
      this.parcel.receiverName = '';
      this.parcel.receiverPhone = '';
    }
  }

  // Sender search and selection
  onSenderSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.senderSearchTerm = searchTerm;
    
    if (searchTerm.trim() === '') {
      this.filteredSenders = [];
      this.showSenderDropdown = false;
      return;
    }
    
    this.filteredSenders = this.customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    );
    this.showSenderDropdown = this.filteredSenders.length > 0;
  }

  onSenderSelect(sender: User): void {
    this.selectedSender = sender;
    this.parcel.senderId = sender.id;
    this.senderSearchTerm = sender.name;
    this.showSenderDropdown = false;
    this.filteredSenders = [];
  }

  onSenderInputFocus(): void {
    if (this.senderSearchTerm.trim() !== '') {
      this.showSenderDropdown = this.filteredSenders.length > 0;
    }
  }

  onSenderInputBlur(): void {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      this.showSenderDropdown = false;
    }, 200);
  }

  // Receiver search and selection
  onReceiverSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.receiverSearchTerm = searchTerm;
    
    if (searchTerm.trim() === '') {
      this.filteredReceivers = [];
      this.showReceiverDropdown = false;
      return;
    }
    
    this.filteredReceivers = this.customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    );
    this.showReceiverDropdown = this.filteredReceivers.length > 0;
  }

  onReceiverSelect(receiver: User): void {
    this.selectedReceiver = receiver;
    this.parcel.receiverId = receiver.id;
    this.receiverSearchTerm = receiver.name;
    this.parcel.receiverName = receiver.name;
    this.parcel.receiverPhone = receiver.phone || '';
    this.showReceiverDropdown = false;
    this.filteredReceivers = [];
  }

  onReceiverInputFocus(): void {
    if (this.receiverSearchTerm.trim() !== '') {
      this.showReceiverDropdown = this.filteredReceivers.length > 0;
    }
  }

  onReceiverInputBlur(): void {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      this.showReceiverDropdown = false;
    }, 200);
  }

  // Courier search and selection
  onCourierSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.courierSearchTerm = searchTerm;
    
    if (searchTerm.trim() === '') {
      this.filteredCouriers = [];
      this.showCourierDropdown = false;
      return;
    }
    
    this.filteredCouriers = this.couriers.filter(courier => 
      courier.name.toLowerCase().includes(searchTerm) ||
      courier.email.toLowerCase().includes(searchTerm)
    );
    this.showCourierDropdown = this.filteredCouriers.length > 0;
  }

  onCourierSelect(courier: Courier): void {
    this.selectedCourier = courier;
    this.parcel.assignedCourierId = courier.id;
    this.courierSearchTerm = courier.name;
    this.showCourierDropdown = false;
    this.filteredCouriers = [];
  }

  onCourierInputFocus(): void {
    if (this.courierSearchTerm.trim() !== '') {
      this.showCourierDropdown = this.filteredCouriers.length > 0;
    }
  }

  onCourierInputBlur(): void {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      this.showCourierDropdown = false;
    }, 200);
  }

  // Courier dropdown selection
  onCourierChange(event: Event): void {
    const courierId = (event.target as HTMLSelectElement).value;
    if (courierId) {
      this.selectedCourier = this.couriers.find(c => c.id === courierId) || null;
      this.parcel.assignedCourierId = courierId;
    } else {
      this.selectedCourier = null;
      this.parcel.assignedCourierId = '';
    }
  }



  // Form validation
  isFormValid(): boolean {
    return !!(
      this.parcel.senderId &&
      this.parcel.receiverId &&
      this.parcel.receiverName &&
      this.parcel.receiverPhone &&
      this.parcel.pickupAddress &&
      this.parcel.destination &&
      this.parcel.weightCategory &&
      ['LIGHT', 'MEDIUM', 'HEAVY'].includes(this.parcel.weightCategory)
    );
  }

  // Form submission
  onSubmit(): void {
    console.log('CreateParcelComponent - onSubmit called');
    console.log('CreateParcelComponent - Form data:', this.parcel);
    
    if (!this.isFormValid()) {
      console.log('CreateParcelComponent - Form validation failed');
      this.error = 'Please fill in all required fields';
      return;
    }

    console.log('CreateParcelComponent - Form validation passed');
    this.isSubmitting = true;
    this.error = '';

    // Prepare payload matching backend DTO
    const parcelPayload: CreateParcelDto = {
      senderId: this.parcel.senderId,
      receiverId: this.parcel.receiverId,
      receiverName: this.parcel.receiverName,
      receiverPhone: this.parcel.receiverPhone,
      pickupAddress: this.parcel.pickupAddress,
      destination: this.parcel.destination,
      weightCategory: this.parcel.weightCategory as 'LIGHT' | 'MEDIUM' | 'HEAVY',
      // assignedCourierId is optional at creation
      ...(this.parcel.assignedCourierId && { assignedCourierId: this.parcel.assignedCourierId })
    };

    console.log('CreateParcelComponent - Sending parcel payload:', parcelPayload);

    this.parcelService.create(parcelPayload).subscribe({
      next: (response: Parcel) => {
        console.log('CreateParcelComponent - Parcel created successfully:', response);
        alert('Parcel created successfully!');
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('CreateParcelComponent - Error creating parcel:', err);
        this.error = err.error?.message || 'Failed to create parcel. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.parcel = {
      senderId: '',
      receiverId: '',
      receiverName: '',
      receiverPhone: '',
      pickupAddress: '',
      destination: '',
      weightCategory: '' as 'LIGHT' | 'MEDIUM' | 'HEAVY' | '',
      assignedCourierId: ''
    };
    
    this.selectedSender = null;
    this.selectedReceiver = null;
    this.selectedCourier = null;
    this.error = '';
    
    // Reset search terms and dropdowns
    this.senderSearchTerm = '';
    this.receiverSearchTerm = '';
    this.courierSearchTerm = '';
    this.filteredSenders = [];
    this.filteredReceivers = [];
    this.filteredCouriers = [];
    this.showSenderDropdown = false;
    this.showReceiverDropdown = false;
    this.showCourierDropdown = false;
  }
}