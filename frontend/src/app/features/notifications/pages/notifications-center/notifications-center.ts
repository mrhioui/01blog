import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { Notifications } from '../../../../core/services/notifications';
import { Notification, NotificationType } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notifications-center-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications-center.html',
  styleUrl: './notifications-center.css',
})
export class NotificationsCenterPage implements OnInit {
  private readonly authService = inject(Auth);
  private readonly notificationsService = inject(Notifications);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly actionInProgress = signal<number | null>(null);

  ngOnInit(): void {
    this.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead || this.actionInProgress() === notification.id) {
      return;
    }

    this.actionInProgress.set(notification.id);
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => item.id === notification.id ? { ...item, isRead: true } : item)
        );
        this.actionInProgress.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.actionInProgress.set(null);
      },
    });
  }

  markAsUnread(notification: Notification): void {
    if (!notification.isRead || this.actionInProgress() === notification.id) {
      return;
    }

    this.actionInProgress.set(notification.id);
    this.notificationsService.markAsUnread(notification.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => item.id === notification.id ? { ...item, isRead: false } : item)
        );
        this.actionInProgress.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.actionInProgress.set(null);
      },
    });
  }

  trackById(_: number, notification: Notification): number {
    return notification.id;
  }

  getNotificationLink(notification: Notification): string[] {
    switch (notification.type) {
      case 'FOLLOW':
        return ['/profile', String(notification.relatedId)];
      case 'NEW_POST':
      case 'POST_LIKE':
      case 'POST_COMMENT':
        return ['/posts', String(notification.relatedId)];
      default:
        return ['/notifications'];
    }
  }

  getNotificationTypeLabel(type: NotificationType): string {
    switch (type) {
      case 'NEW_POST':
        return 'Post';
      case 'POST_LIKE':
        return 'Like';
      case 'POST_COMMENT':
        return 'Comment';
      case 'FOLLOW':
        return 'Subscribe';
    }
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.notificationsService.getAll().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message ?? 'Unable to load notifications.';
  }
}
