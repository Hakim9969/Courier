import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Output() close = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();
  @Output() redirectToLogin = new EventEmitter<void>();
  @Output() registrationSuccessful = new EventEmitter<string>();
  
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  error = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['CUSTOMER', Validators.required] 
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { username, phoneNumber, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      this.successMessage = '';
      return;
    }

    this.error = '';
    this.successMessage = '';

    this.authService.register({
      name: username,
      phoneNumber,
      email,
      password
    }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.registerSuccess.emit();
        // Emit the success message for the login modal
        this.registrationSuccessful.emit('Registration successful! You can now log in with your credentials.');
        // Emit redirect immediately to switch to login modal
        this.redirectToLogin.emit();
      },
      error: err => {
        this.error = err;
        this.successMessage = '';
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
  return this.registerForm.controls[controlName]?.hasError(errorName) && 
         this.registerForm.controls[controlName]?.touched;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  
}
