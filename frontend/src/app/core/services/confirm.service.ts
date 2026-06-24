import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private readonly modalService = inject(NgbModal);

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'success' | 'info' | 'primary';
  }): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmModal, {
      centered: true,
      backdrop: 'static',
      windowClass: 'confirm-modal-window'
    });

    modalRef.componentInstance.title = options.title;
    modalRef.componentInstance.message = options.message;
    if (options.confirmText) modalRef.componentInstance.confirmText = options.confirmText;
    if (options.cancelText) modalRef.componentInstance.cancelText = options.cancelText;
    if (options.type) modalRef.componentInstance.type = options.type;

    return from(modalRef.result).pipe(
      map(result => !!result),
      catchError(() => of(false))
    );
  }

  alert(options: {
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'success' | 'info' | 'primary';
  }): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmModal, {
      centered: true,
      backdrop: 'static',
      windowClass: 'confirm-modal-window'
    });

    modalRef.componentInstance.title = options.title;
    modalRef.componentInstance.message = options.message;
    modalRef.componentInstance.confirmText = options.confirmText || 'OK';
    modalRef.componentInstance.type = options.type || 'info';
    modalRef.componentInstance.alertMode = true;

    return from(modalRef.result).pipe(
      map(result => !!result),
      catchError(() => of(false))
    );
  }
}
