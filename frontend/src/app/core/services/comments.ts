import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Comments {
  private readonly api = inject(Api);

  getAll(): Observable<Comment[]> {
    return this.api.get<Comment[]>('/comments');
  }

  getByPostId(postId: number): Observable<Comment[]> {
    return this.api.get<Comment[]>(`/comments/post/${postId}`);
  }

  create(payload: CreateCommentPayload): Observable<Comment> {
    return this.api.post<Comment, CreateCommentPayload>('/comments', payload);
  }
}

export interface CreateCommentPayload {
  content: string;
  postId: number;
}
