import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PostLike } from '../models/post-like.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Likes {
  private readonly api = inject(Api);

  getAll(): Observable<PostLike[]> {
    return this.api.get<PostLike[]>('/likes');
  }

  create(payload: CreateLikePayload): Observable<PostLike> {
    return this.api.post<PostLike, CreateLikePayload>('/likes', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/likes/${id}`);
  }
}

export interface CreateLikePayload {
  postId: number;
}
