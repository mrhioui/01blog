import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Posts } from '../../services/posts';
import { Post } from '../../../../core/models/post.model';
import { MOCK_POSTS } from '../../../../core/models/mock-data';
import { PostCard } from '../../components/post-card/post-card';
import { Auth } from '../../../auth/services/auth';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private readonly postsService = inject(Posts);
  private readonly authService = inject(Auth);

  posts: Post[] = [];
  users: User[] = [];
  loadingPosts = true;
  loadingUsers = true;
  postErrorMessage = '';
  userErrorMessage = '';
  backendConnected = false;
  readonly savedToken = localStorage.getItem('blog_token');
  readonly savedUser = localStorage.getItem('blog_user');
  readonly currentUser = this.parseCurrentUser();

  ngOnInit(): void {
    this.loadPosts();
    this.loadUsers();
  }

  private parseCurrentUser(): User | null {
    if (!this.savedUser) {
      return null;
    }

    try {
      return JSON.parse(this.savedUser) as User;
    } catch {
      return null;
    }
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.postErrorMessage = '';

    this.postsService.getAll().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loadingPosts = false;
      },
      error: () => {
        this.posts = MOCK_POSTS;
        this.loadingPosts = false;
        this.postErrorMessage = 'The public feed is still being prepared, so sample posts are shown for now.';
      },
    });
  }

  loadUsers(): void {
    if (!this.currentUser || this.currentUser.role !== 'ROLE_ADMIN') {
      this.users = [];
      this.backendConnected = !!this.currentUser;
      this.loadingUsers = false;
      this.userErrorMessage = this.currentUser
        ? 'The community directory is available to admin accounts only.'
        : 'Sign in as an admin to access the community directory.';
      return;
    }

    this.loadingUsers = true;
    this.userErrorMessage = '';

    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.backendConnected = true;
        this.loadingUsers = false;
      },
      error: () => {
        this.backendConnected = false;
        this.loadingUsers = false;
        this.userErrorMessage = 'The community directory is temporarily unavailable.';
      },
    });
  }
}
