import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { ReportService } from '../../../../core/services/reports';
import { User } from '../../../../core/models/user.model';
import { Post } from '../../../../core/models/post.model';
import { Report } from '../../../../core/models/report.model';
import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';
import { HttpErrorResponse } from '@angular/common/http';

type AdminView = 'users' | 'posts' | 'reports';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveUrlPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardPage implements OnInit {
  private readonly authService = inject(Auth);
  private readonly adminService = inject(AdminService);
  private readonly reportService = inject(ReportService);
  private readonly route = inject(ActivatedRoute);

  readonly currentView = signal<AdminView>('users');
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  // Stats
  readonly usersCount = toSignal(this.adminService.getUsersCount(), { initialValue: 0 });
  readonly postsCount = toSignal(this.adminService.getPostsCount(), { initialValue: 0 });
  readonly reportsCount = toSignal(this.reportService.getReportsCount(), { initialValue: 0 });

  // Data for tables
  readonly users = toSignal(this.adminService.getAllUsers(), { initialValue: [] as User[] });
  readonly posts = toSignal(this.adminService.getAllPosts(), { initialValue: [] as Post[] });
  readonly reports = toSignal(this.reportService.getAllReports(), { initialValue: [] as Report[] });

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      if (path.includes('users')) this.currentView.set('users');
      else if (path.includes('posts')) this.currentView.set('posts');
      else if (path.includes('reports')) this.currentView.set('reports');
    });
  }

  setView(view: AdminView): void {
    this.currentView.set(view);
  }

  // Action methods (copied from individual pages for consolidation)
  banUser(id: number): void {
    if (confirm('Are you sure you want to ban this user?')) {
      this.adminService.banUser(id).subscribe({
        next: () => alert('User banned successfully'),
        error: (err: HttpErrorResponse) => console.error('Failed to ban user', err)
      });
    }
  }

  unbanUser(id: number): void {
    if (confirm('Are you sure you want to unban this user?')) {
      this.adminService.unbanUser(id).subscribe({
        next: () => alert('User unbanned successfully'),
        error: (err: HttpErrorResponse) => console.error('Failed to unban user', err)
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => alert('User deleted successfully'),
        error: (err: HttpErrorResponse) => console.error('Failed to delete user', err)
      });
    }
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.adminService.deletePost(id).subscribe({
        next: () => alert('Post deleted successfully'),
        error: (err: HttpErrorResponse) => console.error('Failed to delete post', err)
      });
    }
  }

  deleteReport(id: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.delete(id).subscribe({
        next: () => alert('Report deleted successfully'),
        error: (err: HttpErrorResponse) => console.error('Failed to delete report', err)
      });
    }
  }
}
