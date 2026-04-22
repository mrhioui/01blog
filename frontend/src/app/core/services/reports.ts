import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Report } from '../models/report.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Reports {
  private readonly api = inject(Api);

  getAll(): Observable<Report[]> {
    return this.api.get<Report[]>('/reports');
  }

  create(payload: CreateReportPayload): Observable<Report> {
    return this.api.post<Report, CreateReportPayload>('/reports', payload);
  }
}

export interface CreateReportPayload {
  reportedUserId: number;
  reason: string;
}
