import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Posts } from '../../services/posts';
import { Post } from '../../../../core/models/post.model';
import { PostCard } from '../../components/post-card/post-card';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCard],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css',
})
export class PostDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(Posts);

  protected post = signal<Post | null>(null);
  protected loading = signal(true);
  protected errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPost(+id);
    } else {
      this.errorMessage.set('No post ID provided.');
      this.loading.set(false);
    }
  }

  private loadPost(id: number): void {
    this.loading.set(true);
    this.postsService.getById(id).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to load post.');
        this.loading.set(false);
      },
    });
  }

  onPostUpdated(updatedPost: Post): void {
    this.post.set(updatedPost);
  }

  onPostDeleted(): void {
    // If the post is deleted, we should probably go back to the feed
    void window.history.back();
  }
}
