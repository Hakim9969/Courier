import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-parcel.component.html',
  styleUrl: './create-parcel.component.css'
})
export class CreateParcelComponent {
  parcel = {
    description: '',
    weight: '',
    pickupLocation: '',
    deliveryAddress: '',
    receiverName: '',
    phoneNumber: '',
    email: '',
    expectedReceiveDate: ''
  };

  onSubmit() {
  const currentUser = JSON.parse(localStorage.getItem('sendit_current_user')!); // ✅ Use consistent key
  const stored = localStorage.getItem('parcels');
  const parcels = stored ? JSON.parse(stored) : [];

  const newParcel = {
    ...this.parcel,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
    senderEmail: currentUser?.email || 'unknown'
  };

  parcels.push(newParcel);
  localStorage.setItem('parcels', JSON.stringify(parcels));
  alert('Parcel successfully created!');

  this.parcel = {
    description: '',
    weight: '',
    pickupLocation: '',
    deliveryAddress: '',
    receiverName: '',
    phoneNumber: '',
    email: '',
    expectedReceiveDate: ''
  };
 }

}
