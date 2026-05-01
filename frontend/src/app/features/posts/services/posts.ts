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

  getPaginated(page: number, size: number): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/posts/paginated?page=${page}&size=${size}`);
  }

  getById(id: number): Observable<Post> {
    return this.api.get<Post>(`/posts/${id}`);
  }

  getCurrentUserPosts(): Observable<Post[]> {
    return this.api.get<Post[]>('/users/me/posts');
  }

  getByUserId(userId: number): Observable<Post[]> {
    return this.api.get<Post[]>(`/users/${userId}/posts`);
  }

  create(payload: CreatePostPayload, image?: File): Observable<Post> {
    const formData = new FormData();
    formData.append('content', payload.content);
    if (payload.mediaUrl) {
      formData.append('mediaUrl', payload.mediaUrl);
    }
    if (image) {
      formData.append('image', image);
    }
    return this.api.post<Post, FormData>('/posts', formData);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }
}

export interface CreatePostPayload {
  content: string;
  mediaUrl?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
