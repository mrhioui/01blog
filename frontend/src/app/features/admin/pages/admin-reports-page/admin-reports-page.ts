import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { Report } from '../../../../core/models/report.model';
import { ReportService } from '../../../../core/services/reports';
import { ConfirmService } from '../../../../core/services/confirm.service';

import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveUrlPipe],
  templateUrl: './admin-reports-page.html',
  styleUrl: './admin-reports-page.css',
})
export class AdminReportsPage {
  private readonly authService = inject(Auth);
  private readonly reportService = inject(ReportService);
  private readonly adminService = inject(AdminService);
  private readonly confirmService = inject(ConfirmService);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  reports = signal<Report[]>([]);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (reports) => this.reports.set(reports),
      error: (err) => console.error('Failed to load reports:', err)
    });
  }

  deleteReport(id: number): void {
    this.confirmService.confirm({
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report? This will remove it from the list.',
      confirmText: 'Delete',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.reportService.delete(id).subscribe({
        next: () => {
          this.loadReports();
        },
        error: (err) => {
          console.error('Failed to delete report:', err);
          this.confirmService.alert({
            title: 'Error',
            message: 'Failed to delete report.',
            type: 'danger'
          }).subscribe();
        }
      });
    });
  }

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
        error: (err) => {
          console.error('Failed to ban user:', err);
          this.confirmService.alert({
            title: 'Error',
            message: 'Failed to ban user.',
            type: 'danger'
          }).subscribe();
        }
      });
    });
  }

  deletePost(id: number): void {
    this.confirmService.confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.deletePost(id).subscribe({
        next: () => {
          this.confirmService.alert({
            title: 'Post Deleted',
            message: 'Post deleted successfully.',
            type: 'success'
          }).subscribe();
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          this.confirmService.alert({
            title: 'Error',
            message: 'Failed to delete post.',
            type: 'danger'
          }).subscribe();
        }
      });
    });
  }
}
