import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, LoginComponent, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

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
  registrationSuccessMessage = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.queryParams.subscribe(params => {
      if (params['login']) {
        this.openLoginModal();
      }
      if (params['register']) {
        this.openRegisterModal();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  openLoginModal() {
    this.showLoginModal = true;
  }
  
  closeLoginModal() {
    this.showLoginModal = false;
    this.registrationSuccessMessage = '';
  }
  
  openRegisterModal() {
    this.showRegisterModal = true;
  }
  
  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  // Method to refresh navbar after login
  onLoginSuccess() {
    if (this.navbar) {
      this.navbar.refreshAuthStatus();
    }
  }

  // Method to handle redirect from register to login
  onRegisterSuccess() {
    this.registrationSuccessMessage = '';
    this.closeRegisterModal();
    this.openLoginModal();
  }

  // Method to handle successful registration with message
  onRegistrationSuccessful(message: string) {
    this.registrationSuccessMessage = message;
    this.closeRegisterModal();
    this.openLoginModal();
  }

  // Method to handle redirect from login to register
  onLoginRedirectToRegister() {
    this.closeLoginModal();
    this.openRegisterModal();
  }
}