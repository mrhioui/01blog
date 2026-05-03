import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '../../../features/auth/services/auth';
import { Notifications } from '../../../core/services/notifications';
import { PostCreationModal } from '../../../features/posts/components/post-creation-modal/post-creation-modal';
import { WebsocketService } from '../../../core/services/websocket';
import { User } from '../../../core/models/user.model';
import { Subscription as RxSubscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbCollapseModule, NgbDropdownModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  private readonly authService = inject(Auth);
  private readonly notificationService = inject(Notifications);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly wsService = inject(WebsocketService);

  protected isMenuCollapsed = signal(true);
  protected searchQuery = signal('');
  protected searchResults = signal<User[]>([]);
  protected searchLoading = signal(false);
  protected searchOpen = signal(false);
  protected notificationCount = signal(0);
  protected notifications = signal<any[]>([]);
  protected loadingNotifications = signal(false);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private wsSubscription: RxSubscription | null = null;

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.fetchNotificationCount();
      this.setupWebsocket();
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private setupWebsocket(): void {
    const user = this.currentUser();
    if (!user) return;

    this.wsSubscription = this.wsService.subscribe<any>(`/topic/users/${user.id}/notifications`).subscribe(notification => {
      this.notificationCount.update(c => c + 1);
      if (this.notifications().length > 0) {
        this.notifications.update(list => [notification, ...list]);
      }
    });
  }

  private fetchNotificationCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.notificationCount.set(count),
      error: () => {}
    });
  }

  loadNotifications(): void {
    this.loadingNotifications.set(true);
    this.notificationService.getAll().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loadingNotifications.set(false);
      },
      error: () => this.loadingNotifications.set(false)
    });
  }

  markAsRead(notification: any): void {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        this.notificationCount.update(c => Math.max(0, c - 1));
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.notificationCount.set(0);
      }
    });
  }

  onNotificationClick(notification: any): void {
    this.markAsRead(notification);
    if (notification.type === 'NEW_POST') {
      void this.router.navigate(['/posts', notification.relatedId]);
    }
    this.isMenuCollapsed.set(true);
  }

  openCreatePostModal(): void {
    this.isMenuCollapsed.set(true);
    const modalRef = this.modalService.open(PostCreationModal, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          // If we're not on the feed, we might want to navigate there
          if (this.router.url !== '/') {
            void this.router.navigateByUrl('/');
          }
        }
      },
      () => {}
    );
  }

  logout(): void {
    this.isMenuCollapsed.set(true);
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchOpen.set(true);

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    const query = value.trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      this.searchLoading.set(false);
      return;
    }

    this.searchLoading.set(true);
    this.searchTimer = setTimeout(() => this.searchUsers(query), 250);
  }

  selectUser(user: User): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchOpen.set(false);
    this.isMenuCollapsed.set(true);
    void this.router.navigate(['/profile', user.id]);
  }

  closeSearch(): void {
    setTimeout(() => this.searchOpen.set(false), 150);
  }

  private searchUsers(query: string): void {
    this.authService.searchUsers(query).subscribe({
      next: (users) => {
        const currentUserId = this.currentUser()?.id;
        this.searchResults.set(users.filter(user => user.id !== currentUserId));
        this.searchLoading.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.searchLoading.set(false);
      },
    });
  }
}
