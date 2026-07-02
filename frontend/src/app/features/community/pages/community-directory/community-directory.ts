import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { CommunityService } from '../../../../core/services/community';
import { Subscriptions } from '../../../../core/services/subscriptions';
import { User } from '../../../../core/models/user.model';
import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-community-directory-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveUrlPipe],
  templateUrl: './community-directory.html',
  styleUrl: './community-directory.css',
})
export class CommunityDirectoryPage implements OnInit {
  private readonly authService = inject(Auth);
  private readonly communityService = inject(CommunityService);
  private readonly subscriptionService = inject(Subscriptions);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly actionInProgress = signal<number | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  toggleFollow(user: User): void {
    if (!this.currentUser() || this.actionInProgress() === user.id) {
      return;
    }

    this.actionInProgress.set(user.id);
    this.errorMessage.set('');

    if (user.isSubscribed) {
      this.subscriptionService.delete(user.id).subscribe({
        next: () => {
          this.updateUser(user.id, {
            isSubscribed: false,
            followerCount: Math.max(0, (user.followerCount || 0) - 1),
          });
          this.actionInProgress.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
          this.actionInProgress.set(null);
        },
      });
      return;
    }

    this.subscriptionService.create({ targetId: user.id }).subscribe({
      next: () => {
        this.updateUser(user.id, {
          isSubscribed: true,
          followerCount: (user.followerCount || 0) + 1,
        });
        this.actionInProgress.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.actionInProgress.set(null);
      },
    });
  }

  isCurrentUser(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.communityService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  private updateUser(id: number, patch: Partial<User>): void {
    this.users.update(list =>
      list.map(user => (user.id === id ? { ...user, ...patch } : user))
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message ?? 'Unable to load the community directory.';
  }
}
