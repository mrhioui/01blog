import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '../../../features/auth/services/auth';
import { PostCreationModal } from '../../../features/posts/components/post-creation-modal/post-creation-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbCollapseModule, NgbDropdownModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);

  protected isMenuCollapsed = signal(true);
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

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
}
