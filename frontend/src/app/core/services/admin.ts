import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
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
    const pageSize = 100;
    return this.getPostsPage(0, pageSize).pipe(
      expand((response) => {
        if (response.last) {
          return EMPTY;
        }

        return this.getPostsPage(response.number + 1, pageSize);
      }),
      map((response) => response.content),
      reduce((allPosts, posts) => [...allPosts, ...posts], [] as Post[])
    );
  }

  getPostsCount(): Observable<number> {
    return this.api.get<number>('/posts/count');
  }

  deletePost(id: number): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }

  private getPostsPage(page: number, size: number): Observable<PaginatedResponse<Post>> {
    return this.api.get<PaginatedResponse<Post>>(`/posts/paginated?page=${page}&size=${size}`);
  }
}

interface PaginatedResponse<T> {
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
