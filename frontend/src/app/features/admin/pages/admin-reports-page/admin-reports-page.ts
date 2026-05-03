import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { Report } from '../../../../core/models/report.model';
import { ReportService } from '../../../../core/services/reports';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-reports-page.html',
  styleUrl: './admin-reports-page.css',
})
export class AdminReportsPage implements OnInit {
  private readonly authService = inject(Auth);
  private readonly reportService = inject(ReportService);
  private readonly adminService = inject(AdminService);

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
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.delete(id).subscribe({
        next: () => {
          this.loadReports();
        },
        error: (err) => {
          console.error('Failed to delete report:', err);
          alert('Failed to delete report.');
        }
      });
    }
  }

  banUser(id: number): void {
    if (confirm('Are you sure you want to ban this user?')) {
      this.adminService.banUser(id).subscribe({
        next: () => {
          alert('User banned successfully.');
        },
        error: (err) => {
          console.error('Failed to ban user:', err);
          alert('Failed to ban user.');
        }
      });
    }
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.adminService.deletePost(id).subscribe({
        next: () => {
          alert('Post deleted successfully.');
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          alert('Failed to delete post.');
        }
      });
    }
  }
}
