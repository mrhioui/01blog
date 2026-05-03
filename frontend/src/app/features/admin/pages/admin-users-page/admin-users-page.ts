import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../features/auth/services/auth';
import { User } from '../../../../core/models/user.model';
import { AdminService } from '../../../../core/services/admin';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.css',
})
export class AdminUsersPage {
  private readonly authService = inject(Auth);
  private readonly adminService = inject(AdminService);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  readonly users = toSignal(this.adminService.getAllUsers(), { initialValue: [] as User[] });

  banUser(id: number): void {
    if (confirm('Are you sure you want to ban this user?')) {
      this.adminService.banUser(id).subscribe({
        next: () => alert('User banned successfully'),
        error: (err) => console.error('Failed to ban user', err)
      });
    }
  }

  unbanUser(id: number): void {
    if (confirm('Are you sure you want to unban this user?')) {
      this.adminService.unbanUser(id).subscribe({
        next: () => alert('User unbanned successfully'),
        error: (err) => console.error('Failed to unban user', err)
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => alert('User deleted successfully'),
        error: (err) => console.error('Failed to delete user', err)
      });
    }
  }
}
