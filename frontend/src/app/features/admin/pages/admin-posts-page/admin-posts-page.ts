import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { AdminService } from '../../../../core/services/admin';
import { Post } from '../../../../core/models/post.model';

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
    if (confirm('Are you sure you want to delete this post?')) {
      this.adminService.deletePost(id).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          alert('Failed to delete post.');
        }
      });
    }
  }
}
