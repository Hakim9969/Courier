import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchText: string = '';
  searchRole: string = '';

  ngOnInit() {
    const savedUsers = localStorage.getItem('sendit_users');
    if (savedUsers) {
      const parsedUsers: User[] = JSON.parse(savedUsers);

      // Show all users (or filter if you only want customers)
      this.users = parsedUsers.map(user => ({
        ...user,
        status: user.status ?? 'ACTIVE', // default if not set
        createdAt: user.createdAt ?? new Date().toDateString(), // fallback
      }));
    }
    this.filterUsers();
  }

  filterUsers() {
    const text = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user => {
      const matchesText =
        user.name?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text);
      const matchesRole = this.searchRole ? user.role === this.searchRole : true;
      return matchesText && matchesRole;
    });
  }

  deleteUser(userId: string): void {
  if (confirm('Are you sure you want to delete this user?')) {
    const savedUsers = localStorage.getItem('sendit_users');
    let users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

    // Remove the user from the full list
    users = users.filter(user => user.id !== userId);

    // Save updated list
    localStorage.setItem('sendit_users', JSON.stringify(users));

    // Also update component state
    this.users = users;
    this.filterUsers();
  }
 }

 updateUserRole(userId: string, newRole: 'ADMIN' | 'CUSTOMER') {
  const savedUsers = localStorage.getItem('sendit_users');
  const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

  const user = users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    localStorage.setItem('sendit_users', JSON.stringify(users));
    this.users = users;
    this.filterUsers();
  }
  }


}
