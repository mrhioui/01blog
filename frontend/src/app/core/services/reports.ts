import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly api = inject(Api);

  getAllReports(): Observable<Report[]> {
    return this.api.get<Report[]>('/reports');
  }

  getReportsCount(): Observable<number> {
    return this.api.get<number>('/reports/count');
  }

  create(payload: CreateReportPayload): Observable<Report> {
    return this.api.post<Report, CreateReportPayload>('/reports', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/reports/${id}`);
  }
}

export interface CreateReportPayload {
  reportedUserId?: number;
  reportedPostId?: number;
  reason: string;
}

