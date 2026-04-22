import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../features/auth/services/auth';
import { User } from '../../../../core/models/user.model';
import { Posts } from '../../../../features/posts/services/posts';
import { Post } from '../../../../core/models/post.model';
import { PostCard } from '../../../../features/posts/components/post-card/post-card';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PostCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly postsService = inject(Posts);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    profilePublic: [true],
  });

  currentUser: User | null = null;
  posts: Post[] = [];
  loadingProfile = true;
  loadingPosts = true;
  savingProfile = false;
  profileErrorMessage = '';
  postErrorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadProfile();
    this.loadPosts();
  }

  submit(): void {
    if (this.form.invalid || this.savingProfile) {
      this.form.markAllAsTouched();
      return;
    }

    this.savingProfile = true;
    this.profileErrorMessage = '';
    this.successMessage = '';

    this.authService.updateCurrentUser(this.form.getRawValue()).subscribe({
      next: (user) => {
        const previousUsername = this.currentUser?.username;
        this.currentUser = user;
        this.authService.saveCurrentUser(user);
        this.form.patchValue({
          username: user.username,
          email: user.email,
          profilePublic: user.profilePublic,
        });
        this.savingProfile = false;

        if (previousUsername && previousUsername !== user.username) {
          this.authService.logout();
          void this.router.navigateByUrl('/login');
          return;
        }

        this.successMessage = 'Profile updated successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.profileErrorMessage = error.error?.message ?? 'Profile update failed.';
        this.savingProfile = false;
      },
    });
  }

  private loadProfile(): void {
    this.loadingProfile = true;
    this.profileErrorMessage = '';

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.authService.saveCurrentUser(user);
        this.form.patchValue({
          username: user.username,
          email: user.email,
          profilePublic: user.profilePublic,
        });
        this.loadingProfile = false;
      },
      error: (error: HttpErrorResponse) => {
        this.profileErrorMessage = error.error?.message ?? 'Unable to load your profile.';
        this.loadingProfile = false;
      },
    });
  }

  private loadPosts(): void {
    this.loadingPosts = true;
    this.postErrorMessage = '';

    this.postsService.getCurrentUserPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loadingPosts = false;
      },
      error: (error: HttpErrorResponse) => {
        this.postErrorMessage = error.error?.message ?? 'Unable to load your posts.';
        this.loadingPosts = false;
      },
    });
  }
}
