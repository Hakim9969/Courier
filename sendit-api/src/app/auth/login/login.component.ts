import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Input() registrationSuccessMessage = '';
  
  email = '';
  password = '';
  error = '';
    showPassword = false;

  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() redirectToRegister = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.getRoleFromToken();
        console.log('Login successful, role:', role);
        const redirectPath = role === 'ADMIN' ? '/admin/dashboard' :
                           role === 'CUSTOMER' ? '/home' :
                           role === 'COURIER' ? '/courier/dashboard' : '/';
        console.log('Redirecting to:', redirectPath);
        
        // Emit login success event
        this.loginSuccess.emit();
        
        this.router.navigate([redirectPath]);
        this.close.emit();
      },
      error: err => {
        console.error('Login error:', err);
        this.error = err;
      }
    });
  }

  // Optional: decode role from token
  getRoleFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      return payload.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
