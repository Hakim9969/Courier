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
    expectedReceiveDate: '',
    senderName: '',
    senderEmail: ''
  };

  users: any[] = [];
  senderSuggestions: any[] = [];

  constructor() {
    const savedUsers = localStorage.getItem('sendit_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [];
  }

  onSenderInput() {
    const name = this.parcel.senderName.toLowerCase();
    const email = this.parcel.senderEmail.toLowerCase();
    this.senderSuggestions = this.users.filter(u =>
      (name && u.name.toLowerCase().includes(name)) ||
      (email && u.email.toLowerCase().includes(email))
    ).slice(0, 5);
  }

  selectSender(user: any) {
    this.parcel.senderName = user.name;
    this.parcel.senderEmail = user.email;
    this.senderSuggestions = [];
  }

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('sendit_current_user')!);
    const stored = localStorage.getItem('parcels');
    const parcels = stored ? JSON.parse(stored) : [];

    const newParcel = {
      ...this.parcel,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      senderEmail: this.parcel.senderEmail || currentUser?.email || 'unknown'
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
      expectedReceiveDate: '',
      senderName: '',
      senderEmail: ''
    };
    this.senderSuggestions = [];
  }
}
