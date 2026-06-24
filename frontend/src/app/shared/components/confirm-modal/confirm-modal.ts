import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-container">
      <!-- Animated Icon Header -->
      <div class="icon-wrapper" [ngClass]="type">
        @if (type === 'success') {
          <!-- Checkmark SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="confirm-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        } @else if (type === 'danger' || type === 'warning') {
          <!-- Warning/Alert SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="confirm-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        } @else {
          <!-- Info/Help SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="confirm-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        }
      </div>

      <!-- Content -->
      <div class="confirm-content text-center">
        <h4 class="confirm-title">{{ title }}</h4>
        <p class="confirm-message text-muted">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div class="confirm-actions d-flex gap-3 justify-content-center mt-4">
        @if (!alertMode) {
          <button type="button" class="btn btn-cancel" (click)="activeModal.close(false)">
            {{ cancelText }}
          </button>
        }
        <button type="button" class="btn btn-confirm" [ngClass]="'btn-' + type" (click)="activeModal.close(true)">
          {{ confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container {
      padding: 2.5rem 1.75rem 1.75rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
      position: relative;
      overflow: hidden;
      animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes modalScaleIn {
      from {
        transform: scale(0.92);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Icon Wrapper with glowing pulses */
    .icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      position: relative;
      transition: all 0.3s ease;
    }

    .icon-wrapper.danger {
      background: rgba(220, 53, 69, 0.12);
      color: #dc3545;
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
      animation: pulseDanger 2s infinite;
    }

    .icon-wrapper.warning {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
      animation: pulseWarning 2s infinite;
    }

    .icon-wrapper.success {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
      animation: pulseSuccess 2s infinite;
    }

    .icon-wrapper.info, .icon-wrapper.primary {
      background: rgba(13, 110, 253, 0.12);
      color: #0d6efd;
      box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
      animation: pulseInfo 2s infinite;
    }

    @keyframes pulseDanger {
      0% {
        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
      }
      70% {
        box-shadow: 0 0 0 14px rgba(220, 53, 69, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
      }
    }

    @keyframes pulseWarning {
      0% {
        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
      }
      70% {
        box-shadow: 0 0 0 14px rgba(245, 158, 11, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
      }
    }

    @keyframes pulseSuccess {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
      }
      70% {
        box-shadow: 0 0 0 14px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    @keyframes pulseInfo {
      0% {
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
      }
      70% {
        box-shadow: 0 0 0 14px rgba(13, 110, 253, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
      }
    }

    .confirm-icon {
      width: 36px;
      height: 36px;
      stroke-width: 2.2;
    }

    .confirm-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.65rem;
      color: #0f172a;
    }

    .confirm-message {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #475569;
      margin: 0;
      padding: 0 1rem;
    }

    /* Modern Styled Buttons */
    .btn {
      padding: 0.75rem 1.75rem;
      font-size: 0.925rem;
      font-weight: 600;
      border-radius: 14px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
      outline: none;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
      border-color: #e2e8f0;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
      color: #1e293b;
      transform: translateY(-1px);
    }

    .btn-confirm {
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .btn-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .btn-confirm:active {
      transform: translateY(0);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    .btn-danger:hover {
      background: linear-gradient(135deg, #f87171, #ef4444);
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
    }
    .btn-warning:hover {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    .btn-success:hover {
      background: linear-gradient(135deg, #34d399, #10b981);
    }

    .btn-info {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
    }
    .btn-info:hover {
      background: linear-gradient(135deg, #38bdf8, #0ea5e9);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #818cf8, #6366f1);
    }
  `]
})
export class ConfirmModal {
  readonly activeModal = inject(NgbActiveModal);

  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'success' | 'info' | 'primary' = 'primary';
  @Input() alertMode = false;
}
