import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  contactInfo = {
    phone: '+254 745185041',
    email: 'hola@sendit.co@gmail.com',
    instagram: 'Instagram',
    linkedin: 'LinkedIn'
  };

  aboutLinks = [
    'About Us',
    'Help',
    'Testimonials',
    'Contact Us',
    'Improving Lives'
  ];

  networkLinks = [
    'Our Global Carrier Network',
    'Become a Partner',
    'Terms & Conditions',
    'Privacy & Policy'
  ];
}