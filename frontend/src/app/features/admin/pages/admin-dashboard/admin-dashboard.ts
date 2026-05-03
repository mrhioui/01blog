import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { ReportService } from '../../../../core/services/reports';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardPage {
  private readonly authService = inject(Auth);
  private readonly adminService = inject(AdminService);
  private readonly reportService = inject(ReportService);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  readonly usersCount = toSignal(this.adminService.getUsersCount(), { initialValue: 0 });
  readonly postsCount = toSignal(this.adminService.getPostsCount(), { initialValue: 0 });
  readonly reportsCount = toSignal(this.reportService.getReportsCount(), { initialValue: 0 });
}
