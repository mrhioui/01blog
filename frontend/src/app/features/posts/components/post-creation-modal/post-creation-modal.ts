import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Posts } from '../../services/posts';

@Component({
  selector: 'app-post-creation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-creation-modal.html',
  styleUrl: './post-creation-modal.css',
})
export class PostCreationModal {
  private readonly activeModal = inject(NgbActiveModal);
  private readonly formBuilder = inject(FormBuilder);
  private readonly postsService = inject(Posts);

  protected readonly form = this.formBuilder.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
    mediaUrl: [''],
  });

  protected loading = signal(false);
  protected errorMessage = signal('');
  protected selectedFile = signal<File | null>(null);
  protected previewUrl = signal<string | null>(null);
  protected previewType = signal<'image' | 'video' | null>(null);

  protected dismiss(): void {
    this.activeModal.dismiss();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.errorMessage.set('Please select an image or video file.');
        input.value = '';
        return;
      }
      this.selectedFile.set(file);
      this.previewType.set(file.type.startsWith('video/') ? 'video' : 'image');
      this.errorMessage.set('');

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeMedia(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.previewType.set(null);
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.postsService.create(this.form.getRawValue(), this.selectedFile() ?? undefined).subscribe({
      next: (post) => {
        this.loading.set(false);
        this.activeModal.close(post);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'Failed to create post. Please try again.');
      },
    });
  }
}
