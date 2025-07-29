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
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userService.softDelete(id).subscribe({
      next: () => this.loadUsers(),
      error: err =>
        this.error = err.error?.message || 'Failed to delete user'
    });
  }
}
