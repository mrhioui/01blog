import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PostLike } from '../models/post-like.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Likes {
  private readonly api = inject(Api);

  create(payload: CreateLikePayload): Observable<PostLike> {
    return this.api.post<PostLike, CreateLikePayload>('/likes', payload);
  }

  getStatus(postId: number): Observable<LikeStatus> {
    return this.api.get<LikeStatus>(`/likes/post/${postId}/status`);
  }

  toggle(postId: number): Observable<LikeStatus> {
    return this.api.post<LikeStatus, Record<string, never>>(`/likes/post/${postId}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/likes/${id}`);
  }
}

export interface CreateLikePayload {
  postId: number;
}

export interface LikeStatus {
  postId: number;
  liked: boolean;
  likeCount: number;
}
