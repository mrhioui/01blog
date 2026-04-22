import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '../../../features/auth/services/auth';

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

  protected isMenuCollapsed = true;
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  logout(): void {
    this.isMenuCollapsed = true;
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
