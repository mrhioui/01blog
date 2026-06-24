import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../features/auth/services/auth';
import { User } from '../../../../core/models/user.model';
import { AdminService } from '../../../../core/services/admin';
import { ConfirmService } from '../../../../core/services/confirm.service';

import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveUrlPipe],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.css',
})
export class AdminUsersPage {
  private readonly authService = inject(Auth);
  private readonly adminService = inject(AdminService);
  private readonly confirmService = inject(ConfirmService);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  readonly users = toSignal(this.adminService.getAllUsers(), { initialValue: [] as User[] });

  banUser(id: number): void {
    this.confirmService.confirm({
      title: 'Ban User',
      message: 'Are you sure you want to ban this user? This will suspend their account activity.',
      confirmText: 'Ban User',
      type: 'warning'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.banUser(id).subscribe({
        next: () => {
          this.confirmService.alert({
            title: 'User Banned',
            message: 'User banned successfully.',
            type: 'success'
          }).subscribe();
        },
        error: (err) => console.error('Failed to ban user', err)
      });
    });
  }

  unbanUser(id: number): void {
    this.confirmService.confirm({
      title: 'Unban User',
      message: 'Are you sure you want to unban this user? This will restore their account access.',
      confirmText: 'Unban User',
      type: 'primary'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.unbanUser(id).subscribe({
        next: () => {
          this.confirmService.alert({
            title: 'User Unbanned',
            message: 'User unbanned successfully.',
            type: 'success'
          }).subscribe();
        },
        error: (err) => console.error('Failed to unban user', err)
      });
    });
  }

  deleteUser(id: number): void {
    this.confirmService.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.confirmService.alert({
            title: 'User Deleted',
            message: 'User deleted successfully.',
            type: 'success'
          }).subscribe();
        },
        error: (err) => console.error('Failed to delete user', err)
      });
    });
  }
}
