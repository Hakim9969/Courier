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
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  error = '';

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

    const { username, phoneNumber, email, password, confirmPassword,role } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    try {
      this.authService.register({name: username, phoneNumber, email, password, role });
      alert('Registration successful!');
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err.message;
    }
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
