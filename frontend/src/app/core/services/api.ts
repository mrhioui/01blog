import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint));
  }

  post<TResponse, TPayload>(endpoint: string, payload: TPayload): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(endpoint), payload);
  }

  put<TResponse, TPayload>(endpoint: string, payload: TPayload): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(endpoint), payload);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint));
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }
}
