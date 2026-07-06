import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { Post } from '../../../../core/models/post.model';
import { ConfirmService } from '../../../../core/services/confirm.service';

import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-admin-posts-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveUrlPipe],
  templateUrl: './admin-posts-page.html',
  styleUrl: './admin-posts-page.css',
})
export class AdminPostsPage {
  private readonly authService = inject(Auth);
  private readonly adminService = inject(AdminService);
  private readonly confirmService = inject(ConfirmService);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  posts = signal<Post[]>([]);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.adminService.getAllPosts().subscribe({
      next: (posts) => this.posts.set(posts),
      error: (err) => console.error('Failed to load posts:', err)
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
          this.loadPosts();
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
