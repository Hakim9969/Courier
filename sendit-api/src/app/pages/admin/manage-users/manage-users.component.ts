// src/app/pages/admin/manage-users/manage-users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User, UserService } from '../../../shared/services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css'],
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  error: string = '';
  searchText: string = '';
  searchRole: string = '';
  
  // Delete confirmation modal
  showDeleteModal = false;
  userToDelete: User | null = null;
  isDeleting = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users = res;
        this.filterUsers();
      },
      error: (err) =>
        this.error = err.error?.message || 'Failed to load users'
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = this.searchText ?
        user.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchText.toLowerCase()) : true;

      const matchRole = this.searchRole ? user.role === this.searchRole : true;
      return matchSearch && matchRole;
    });
  }

  updateUserRole(id: string, newRole: 'CUSTOMER' | 'ADMIN'): void {
    this.userService.updateRole(id, newRole).subscribe({
      next: () => this.loadUsers(),
      error: err =>
        this.error = err.error?.message || 'Failed to update role'
    });
  }

  deleteUser(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    }
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    
    this.isDeleting = true;
    this.userService.softDelete(this.userToDelete.id).subscribe({
      next: () => {
        this.loadUsers();
        this.closeDeleteModal();
        this.showSuccessMessage('User deleted successfully!');
      },
      error: err => {
        this.closeDeleteModal();
        this.showErrorMessage(err.error?.message || 'Failed to delete user');
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.isDeleting = false;
  }

  showSuccessMessage(message: string): void {
    // Create a temporary success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    // Animate in
    setTimeout(() => {
      successDiv.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      successDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 300);
    }, 3000);
  }

  showErrorMessage(message: string): void {
    // Create a temporary error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Animate in
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 300);
    }, 3000);
  }
}
