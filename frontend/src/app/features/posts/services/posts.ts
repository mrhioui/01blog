import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post.model';
import { Api } from '../../../core/services/api';

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private readonly api = inject(Api);

  getAll(): Observable<Post[]> {
    return this.api.get<Post[]>('/posts');
  }

  getById(id: number): Observable<Post> {
    return this.api.get<Post>(`/posts/${id}`);
  }

  getCurrentUserPosts(): Observable<Post[]> {
    return this.api.get<Post[]>('/users/me/posts');
  }

  create(payload: CreatePostPayload): Observable<Post> {
    return this.api.post<Post, CreatePostPayload>('/posts', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }
}

export interface CreatePostPayload {
  content: string;
  mediaUrl?: string;
}
