import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '../../../../features/auth/services/auth';
import { Subscriptions } from '../../../../core/services/subscriptions';
import { User } from '../../../../core/models/user.model';
import { Posts } from '../../../../features/posts/services/posts';
import { Post } from '../../../../core/models/post.model';
import { PostCard } from '../../../../features/posts/components/post-card/post-card';
import { PostCreationModal } from '../../../../features/posts/components/post-creation-modal/post-creation-modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PostCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly subscriptionService = inject(Subscriptions);
  private readonly postsService = inject(Posts);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    headline: [''],
    location: [''],
    about: [''],
    profilePublic: [true],
  });

  readonly currentUser = computed(() => this.authService.currentUser());
  profileUser = signal<User | null>(null);
  isOwnProfile = signal(true);
  posts = signal<Post[]>([]);
  
  loadingProfile = signal(true);
  loadingPosts = signal(true);
  savingProfile = signal(false);
  
  loadingErrorMessage = signal('');
  savingErrorMessage = signal('');
  postErrorMessage = signal('');
  successMessage = signal('');
  
  profileImageLoadFailed = signal(false);
  bannerImageLoadFailed = signal(false);
  
  selectedProfileImageFile = signal<File | null>(null);
  selectedProfileImagePreviewUrl = signal<string | null>(null);
  selectedBannerImageFile = signal<File | null>(null);
  selectedBannerImagePreviewUrl = signal<string | null>(null);
  
  confirmingProfileImage = signal(false);
  confirmingBannerImage = signal(false);
  savingImage = signal(false);

  showEditForm = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadOtherUserProfile(+id);
      } else {
        this.loadOwnProfile();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearSelectedImages();
  }

  toggleEditForm(): void {
    this.showEditForm.update(v => !v);
    const user = this.profileUser();
    if (this.showEditForm() && user) {
      this.patchForm(user);
    }
    this.savingErrorMessage.set('');
  }

  toggleSubscription(): void {
    const user = this.profileUser();
    if (!user || this.isOwnProfile() || !this.currentUser()) return;

    if (user.isSubscribed) {
      this.subscriptionService.delete(user.id).subscribe({
        next: () => {
          this.profileUser.set({
            ...user,
            isSubscribed: false,
            followerCount: Math.max(0, (user.followerCount || 0) - 1)
          });
        },
        error: (error: HttpErrorResponse) => {
          alert(error.error?.message ?? 'Failed to unsubscribe.');
        }
      });
    } else {
      this.subscriptionService.create({ targetId: user.id }).subscribe({
        next: () => {
          this.profileUser.set({
            ...user,
            isSubscribed: true,
            followerCount: (user.followerCount || 0) + 1
          });
        },
        error: (error: HttpErrorResponse) => {
          alert(error.error?.message ?? 'Failed to subscribe.');
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.savingProfile()) {
      this.form.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    this.savingErrorMessage.set('');
    this.successMessage.set('');

    this.authService.updateCurrentUser({
      ...this.form.getRawValue(),
      profileImageFile: null,
      bannerImageFile: null,
    }).subscribe({
      next: (user) => {
        const currentUser = this.currentUser();
        const previousUsername = currentUser?.username;
        this.applyUser(user);
        this.savingProfile.set(false);
        this.showEditForm.set(false);

        if (previousUsername && previousUsername !== user.username) {
          this.authService.logout();
          void this.router.navigateByUrl('/login');
          return;
        }

        this.successMessage.set('Profile updated successfully.');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.savingErrorMessage.set(error.error?.message ?? 'Failed to update profile.');
        this.savingProfile.set(false);
      },
    });
  }

  private loadOwnProfile(): void {
    this.isOwnProfile.set(true);
    this.loadingErrorMessage.set('');
    
    const cachedUser = this.authService.currentUser();
    if (cachedUser) {
      this.applyUser(cachedUser);
      this.loadingProfile.set(false);
    } else {
      this.loadingProfile.set(true);
    }

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.applyUser(user);
        this.loadingProfile.set(false);
        this.loadPosts(user.id);
      },
      error: (error: HttpErrorResponse) => {
        if (!this.profileUser()) {
          this.loadingErrorMessage.set(error.error?.message ?? 'Unable to load profile.');
        }
        this.loadingProfile.set(false);
      },
    });
  }

  private loadOtherUserProfile(id: number): void {
    const currentCached = this.authService.currentUser();
    this.isOwnProfile.set(currentCached?.id === id);
    
    this.loadingProfile.set(true);
    this.loadingErrorMessage.set('');

    this.authService.getUserProfile(id).subscribe({
      next: (user) => {
        this.profileUser.set(user);
        if (this.isOwnProfile()) {
          this.applyUser(user);
        }
        this.loadingProfile.set(false);
        this.loadPosts(id);
      },
      error: (error: HttpErrorResponse) => {
        this.loadingErrorMessage.set(error.error?.message ?? 'Unable to load profile.');
        this.loadingProfile.set(false);
      },
    });
  }

  private loadPosts(userId: number): void {
    this.loadingPosts.set(true);
    this.postErrorMessage.set('');

    const postsObservable = (this.isOwnProfile())
      ? this.postsService.getCurrentUserPosts()
      : this.postsService.getByUserId(userId);

    postsObservable.subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loadingPosts.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load posts:', error);
        this.posts.set([]); 
        this.postErrorMessage.set(error.error?.message ?? 'Unable to load activity.');
        this.loadingPosts.set(false);
      },
    });
  }

  profileImageSrc(): string | null {
    const preview = this.selectedProfileImagePreviewUrl();
    if (preview) {
      return preview;
    }
    if (this.profileImageLoadFailed()) {
      return null;
    }
    return this.resolveImageUrl(this.profileUser()?.profileImageUrl);
  }

  bannerImageSrc(): string | null {
    const preview = this.selectedBannerImagePreviewUrl();
    if (preview) {
      return preview;
    }
    if (this.bannerImageLoadFailed()) {
      return null;
    }
    return this.resolveImageUrl(this.profileUser()?.bannerImageUrl);
  }

  profileInitial(): string {
    return this.profileUser()?.username?.trim().charAt(0).toUpperCase() || '?';
  }

  onProfileImageError(): void {
    this.profileImageLoadFailed.set(true);
  }

  onBannerImageError(): void {
    this.bannerImageLoadFailed.set(true);
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  }

  onPostDeleted(postId: number): void {
    this.posts.update(posts => posts.filter(post => post.id !== postId));
    const user = this.profileUser();
    if (user?.postCount) {
      this.profileUser.set({ ...user, postCount: Math.max(0, user.postCount - 1) });
    }
  }

  openCreatePostModal(): void {
    const modalRef = this.modalService.open(PostCreationModal, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.result.then(
      (result) => {
        if (result && this.isOwnProfile()) {
          const user = this.profileUser();
          if (user) {
            this.loadPosts(user.id);
            // Increment post count locally
            this.profileUser.set({
              ...user,
              postCount: (user.postCount || 0) + 1
            });
          }
        }
      },
      () => {}
    );
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    const currentPreview = this.selectedProfileImagePreviewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }

    this.selectedProfileImageFile.set(file);
    this.selectedProfileImagePreviewUrl.set(URL.createObjectURL(file));
    this.confirmingProfileImage.set(true);
    input.value = '';
  }

  onBannerImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    const currentPreview = this.selectedBannerImagePreviewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }

    this.selectedBannerImageFile.set(file);
    this.selectedBannerImagePreviewUrl.set(URL.createObjectURL(file));
    this.confirmingBannerImage.set(true);
    input.value = '';
  }

  cancelProfileImageUpdate(): void {
    const currentPreview = this.selectedProfileImagePreviewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }
    this.selectedProfileImageFile.set(null);
    this.selectedProfileImagePreviewUrl.set(null);
    this.confirmingProfileImage.set(false);
  }

  cancelBannerImageUpdate(): void {
    const currentPreview = this.selectedBannerImagePreviewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }
    this.selectedBannerImageFile.set(null);
    this.selectedBannerImagePreviewUrl.set(null);
    this.confirmingBannerImage.set(false);
  }

  confirmProfileImageUpdate(): void {
    const file = this.selectedProfileImageFile();
    if (!file || !this.currentUser()) return;
    this.saveImage(file, 'profile');
  }

  confirmBannerImageUpdate(): void {
    const file = this.selectedBannerImageFile();
    if (!file || !this.currentUser()) return;
    this.saveImage(file, 'banner');
  }

  private saveImage(file: File, type: 'profile' | 'banner'): void {
    const user = this.currentUser();
    if (!user) return;
    
    this.savingImage.set(true);
    this.authService.updateCurrentUser({
      username: user.username,
      email: user.email,
      profilePublic: user.profilePublic,
      headline: user.headline,
      location: user.location,
      about: user.about,
      profileImageFile: type === 'profile' ? file : null,
      bannerImageFile: type === 'banner' ? file : null,
    }).subscribe({
      next: (user) => {
        this.applyUser(user);
        this.savingImage.set(false);
        if (type === 'profile') this.confirmingProfileImage.set(false);
        if (type === 'banner') this.confirmingBannerImage.set(false);
        this.successMessage.set(`${type === 'profile' ? 'Profile picture' : 'Banner'} updated!`);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: HttpErrorResponse) => {
        alert(error.error?.message ?? 'Failed to update image.');
        this.savingImage.set(false);
      }
    });
  }

  private applyUser(user: User): void {
    const isSameUser = this.profileUser()?.id === user.id;
    this.profileUser.set(user);
    
    if (!isSameUser) {
      this.profileImageLoadFailed.set(false);
      this.bannerImageLoadFailed.set(false);
    }
    
    this.authService.saveCurrentUser(user);
    this.clearSelectedImages();
    this.patchForm(user);
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      username: user.username,
      email: user.email,
      headline: user.headline ?? '',
      location: user.location ?? '',
      about: user.about ?? '',
      profilePublic: user.profilePublic,
    });
  }

  private clearSelectedImages(): void {
    const profilePreview = this.selectedProfileImagePreviewUrl();
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }
    const bannerPreview = this.selectedBannerImagePreviewUrl();
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    this.selectedProfileImageFile.set(null);
    this.selectedProfileImagePreviewUrl.set(null);
    this.selectedBannerImageFile.set(null);
    this.selectedBannerImagePreviewUrl.set(null);
    this.confirmingProfileImage.set(false);
    this.confirmingBannerImage.set(false);
  }

  private resolveImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const backendBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}
