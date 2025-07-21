import { Component, Output, EventEmitter } from '@angular/core';
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
  email = '';
  password = '';
  error = '';
  showPassword = false;

  @Output() close = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    try {
      const user = this.authService.login(this.email, this.password);
      this.router.navigate([user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Login failed';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
