import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class Notifications {
  private readonly api = inject(Api);

  getAll(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/notifications');
  }

  getUnreadCount(): Observable<number> {
    return this.api.get<number>('/notifications/unread-count');
  }

  markAsRead(id: number): Observable<void> {
    return this.api.post<void, null>(`/notifications/${id}/mark-as-read`, null);
  }

  markAsUnread(id: number): Observable<void> {
    return this.api.post<void, null>(`/notifications/${id}/mark-as-unread`, null);
  }

  markAllAsRead(): Observable<void> {
    return this.api.post<void, null>('/notifications/mark-all-as-read', null);
  }
}
