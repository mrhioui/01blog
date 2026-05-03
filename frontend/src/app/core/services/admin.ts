import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly api = inject(Api);

  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  getUsersCount(): Observable<number> {
    return this.api.get<number>('/users/count');
  }

  banUser(id: number): Observable<void> {
    return this.api.post<void, null>(`/users/${id}/ban`, null);
  }

  unbanUser(id: number): Observable<void> {
    return this.api.post<void, null>(`/users/${id}/unban`, null);
  }

  deleteUser(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  getAllPosts(): Observable<Post[]> {
    return this.api.get<Post[]>('/posts');
  }

  getPostsCount(): Observable<number> {
    return this.api.get<number>('/posts/count');
  }

  deletePost(id: number): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }
}
