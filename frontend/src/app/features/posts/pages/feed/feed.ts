import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Posts } from '../../services/posts';
import { Post } from '../../../../core/models/post.model';
import { MOCK_POSTS } from '../../../../core/models/mock-data';
import { PostCard } from '../../components/post-card/post-card';
import { Auth } from '../../../auth/services/auth';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private readonly postsService = inject(Posts);
  private readonly authService = inject(Auth);

  posts = signal<Post[]>([]);
  users = signal<User[]>([]);
  loadingPosts = signal(true);
  loadingMore = signal(false);
  loadingUsers = signal(true);
  postErrorMessage = signal('');
  userErrorMessage = signal('');
  backendConnected = signal(false);

  readonly currentUser = computed(() => this.authService.currentUser());

  currentPage = 0;
  pageSize = 10;
  isLastPage = signal(false);

  ngOnInit(): void {
    this.loadInitialPosts();
    this.loadUsers();
  }

  loadInitialPosts(): void {
    this.loadingPosts.set(true);
    this.postErrorMessage.set('');
    this.currentPage = 0;

    this.postsService.getPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.posts.set(response.content);
        this.isLastPage.set(response.last);
        this.loadingPosts.set(false);
        this.backendConnected.set(true);
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        // Fallback to mock data if backend fails
        this.posts.set(MOCK_POSTS.slice(0, 10));
        this.isLastPage.set(true);
        this.loadingPosts.set(false);
        this.postErrorMessage.set('The public feed is still being prepared, so sample posts are shown for now.');
      },
    });
  }

  loadMorePosts(): void {
    if (this.isLastPage() || this.loadingMore()) return;

    this.loadingMore.set(true);
    this.currentPage++;

    this.postsService.getPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.posts.update(p => [...p, ...response.content]);
        this.isLastPage.set(response.last);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
        this.postErrorMessage.set('Failed to load more posts.');
      },
    });
  }

  loadUsers(): void {
    const user = this.currentUser();
    if (!user || user.role !== 'ROLE_ADMIN') {
      this.users.set([]);
      this.backendConnected.set(!!user);
      this.loadingUsers.set(false);
      this.userErrorMessage.set(user
        ? 'The community directory is available to admin accounts only.'
        : 'Sign in as an admin to access the community directory.');
      return;
    }

    this.loadingUsers.set(true);
    this.userErrorMessage.set('');

    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.backendConnected.set(true);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.backendConnected.set(false);
        this.loadingUsers.set(false);
        this.userErrorMessage.set('The community directory is temporarily unavailable.');
      },
    });
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  }

  onPostDeleted(postId: number): void {
    this.posts.update(posts => posts.filter(post => post.id !== postId));
  }
}
