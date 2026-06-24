import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Post } from '../../../../core/models/post.model';
import { Comment as PostComment } from '../../../../core/models/comment.model';
import { ReportModal } from '../../../../shared/components/report-modal/report-modal';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { environment } from '../../../../../environments/environment';
import { Auth } from '../../../auth/services/auth';
import { Posts } from '../../services/posts';
import { Likes } from '../../../../core/services/likes';
import { Comments } from '../../../../core/services/comments';
import { Subscription as RxSubscription } from 'rxjs';

import { ResolveUrlPipe } from '../../../../shared/pipes/resolve-url.pipe';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, ResolveUrlPipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnDestroy {
  private readonly authService = inject(Auth);
  private readonly postsService = inject(Posts);
  private readonly likesService = inject(Likes);
  private readonly commentsService = inject(Comments);
  private readonly modalService = inject(NgbModal);
  private readonly confirmService = inject(ConfirmService);

  post = input.required<Post>();
  postUpdated = output<Post>();
  postDeleted = output<number>();

  editing = signal(false);
  saving = signal(false);
  deleting = signal(false);
  errorMessage = signal('');
  editContent = signal('');
  editImageFile = signal<File | null>(null);
  editImagePreviewUrl = signal<string | null>(null);
  editImagePreviewType = signal<'image' | 'video' | null>(null);
  likeCount = signal(0);
  commentCount = signal(0);
  likedByCurrentUser = signal(false);
  liking = signal(false);
  commentsOpen = signal(false);
  commentsLoading = signal(false);
  commenting = signal(false);
  comments = signal<PostComment[]>([]);
  commentContent = signal('');

  private wsSubscriptions: RxSubscription[] = [];

  currentUser = computed(() => this.authService.currentUser());
  isOwnPost = computed(() => this.currentUser()?.id === this.post().author.id);

  private readonly syncPostState = effect(() => {
    const post = this.post();
    this.likeCount.set(post.likeCount ?? 0);
    this.commentCount.set(post.commentCount ?? 0);
    this.likedByCurrentUser.set(Boolean(post.likedByCurrentUser));
  });

  ngOnDestroy(): void {
    this.clearEditImage();
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
  }


  protected isVideoUrl(mediaUrl: string | null | undefined): boolean {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(mediaUrl ?? '');
  }

  protected isEditPreviewVideo(): boolean {
    const previewType = this.editImagePreviewType();
    if (previewType) {
      return previewType === 'video';
    }
    return this.isVideoUrl(this.post().mediaUrl);
  }

  startEdit(): void {
    this.editContent.set(this.post().content);
    this.errorMessage.set('');
    this.clearEditImage();
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.errorMessage.set('');
    this.editContent.set('');
    this.clearEditImage();
  }

  onEditImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      this.errorMessage.set('Please choose an image or video file.');
      input.value = '';
      return;
    }

    this.clearEditImage();
    this.editImageFile.set(file);
    this.editImagePreviewType.set(file.type.startsWith('video/') ? 'video' : 'image');
    this.editImagePreviewUrl.set(URL.createObjectURL(file));
    this.errorMessage.set('');
    input.value = '';
  }

  saveEdit(): void {
    const content = this.editContent().trim();
    if (!content || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.postsService.update(this.post().id, {
      content,
      mediaUrl: this.post().mediaUrl,
    }, this.editImageFile() ?? undefined).subscribe({
      next: (post) => {
        this.postUpdated.emit(post);
        this.saving.set(false);
        this.editing.set(false);
        this.clearEditImage();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to update post.');
        this.saving.set(false);
      },
    });
  }

  deletePost(): void {
    if (this.deleting()) {
      return;
    }

    this.confirmService.confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.deleting.set(true);
      this.errorMessage.set('');

      this.postsService.delete(this.post().id).subscribe({
        next: () => {
          this.postDeleted.emit(this.post().id);
          this.deleting.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.message ?? 'Failed to delete post.');
          this.deleting.set(false);
        },
      });
    });
  }

  toggleLike(): void {
    if (!this.currentUser() || this.liking()) {
      return;
    }

    this.liking.set(true);
    this.errorMessage.set('');

    this.likesService.toggle(this.post().id).subscribe({
      next: (status) => {
        this.likedByCurrentUser.set(status.liked);
        this.likeCount.set(status.likeCount);
        this.liking.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to update like.');
        this.liking.set(false);
      },
    });
  }

  toggleComments(): void {
    this.commentsOpen.update(open => !open);
    if (this.commentsOpen() && !this.comments().length) {
      this.loadComments();
    }
  }

  submitComment(): void {
    const content = this.commentContent().trim();
    if (!this.currentUser() || !content || this.commenting()) {
      return;
    }

    this.commenting.set(true);
    this.errorMessage.set('');

    this.commentsService.create({ postId: this.post().id, content }).subscribe({
      next: (comment) => {
        this.comments.update(comments => [...comments, comment]);
        this.commentCount.update(count => count + 1);
        this.commentContent.set('');
        this.commenting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to add comment.');
        this.commenting.set(false);
      },
    });
  }

  openReportModal(): void {
    if (!this.currentUser()) return;

    const modalRef = this.modalService.open(ReportModal, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.reportedPostId = this.post().id;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.confirmService.alert({
            title: 'Report Submitted',
            message: 'Report submitted successfully. Thank you for helping keep our community safe.',
            type: 'success'
          }).subscribe();
        }
      },
      () => {}
    );
  }

  private loadComments(): void {
    this.commentsLoading.set(true);
    this.errorMessage.set('');

    this.commentsService.getByPostId(this.post().id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to load comments.');
        this.commentsLoading.set(false);
      },
    });
  }

  protected clearEditImage(): void {
    const preview = this.editImagePreviewUrl();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.editImageFile.set(null);
    this.editImagePreviewUrl.set(null);
    this.editImagePreviewType.set(null);
  }
}
