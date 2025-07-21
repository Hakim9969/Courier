import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, LoginComponent, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  testimonials = [
    {
      name: 'John Smith',
      rating: 5,
      comment: 'Excellent service! My package arrived right on time and in perfect condition. The tracking system kept me informed throughout the entire process.',
      avatar: '/assets/images/Profilepic2.jpg'
    },
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Outstanding courier service. Professional, reliable, and affordable. I\'ve been using them for months and never had any issues.',
      avatar: 'assets/images/profilepic1.jpg'
    }
  ];

  networkStats = [
    { number: '50+', label: 'Cities Covered' },
    { number: '1000+', label: 'Satisfied Clients' },
    { number: '50+', label: 'Awards Won' },
    { number: '10k+', label: 'Packages Delivered' }
  ];

  showLoginModal = false;
  showRegisterModal = false;

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params['login']) {
        this.openLoginModal();
      }
      if (params['register']) {
        this.openRegisterModal();
      }
    });
  }

  openLoginModal() {
    this.showLoginModal = true;
  }
  closeLoginModal() {
    this.showLoginModal = false;
  }
  openRegisterModal() {
    this.showRegisterModal = true;
  }
  closeRegisterModal() {
    this.showRegisterModal = false;
  }
}