import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from '../../../core/services/reports';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header border-0 pb-0">
      <h5 class="modal-title fw-bold">Report Content</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body p-4">
      <p class="text-muted small mb-4">
        Help us understand what's happening. Your report is anonymous unless it's for intellectual property infringement.
      </p>
      
      <form [formGroup]="reportForm" (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase">Reason for report</label>
          <textarea 
            class="form-control" 
            rows="4" 
            formControlName="reason"
            placeholder="Please describe why you are reporting this..."></textarea>
          <div *ngIf="reportForm.get('reason')?.touched && reportForm.get('reason')?.errors?.['required']" class="text-danger small mt-1">
            Reason is required.
          </div>
          <div *ngIf="reportForm.get('reason')?.touched && reportForm.get('reason')?.errors?.['minlength']" class="text-danger small mt-1">
            Please provide at least 10 characters.
          </div>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-danger small mb-3">
          {{ errorMessage() }}
        </div>

        <div class="d-flex gap-2 justify-content-end mt-4">
          <button type="button" class="btn btn-light rounded-pill px-4" (click)="activeModal.dismiss()" [disabled]="submitting()">Cancel</button>
          <button type="submit" class="btn btn-danger rounded-pill px-4" [disabled]="reportForm.invalid || submitting()">
            <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
            Submit Report
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-control {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
    }
    .form-control:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }
  `]
})
export class ReportModal {
  @Input() reportedUserId?: number;
  @Input() reportedPostId?: number;

  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly confirmService = inject(ConfirmService);
  readonly activeModal = inject(NgbActiveModal);

  reportForm = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  submitting = signal(false);
  errorMessage = signal('');

  submit() {
    if (this.reportForm.invalid || this.submitting()) return;

    this.confirmService.confirm({
      title: 'Submit Report',
      message: 'Are you sure you want to submit this report? This action will be reviewed by administrators.',
      confirmText: 'Submit Report',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.submitting.set(true);
      this.errorMessage.set('');

      const payload = {
        reportedUserId: this.reportedUserId,
        reportedPostId: this.reportedPostId,
        reason: this.reportForm.value.reason!
      };

      this.reportService.create(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.activeModal.close(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to submit report. Please try again.');
        }
      });
    });
  }
}
