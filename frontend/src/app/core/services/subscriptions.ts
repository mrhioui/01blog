import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Subscriptions {
  private readonly api = inject(Api);

  getAll(): Observable<Subscription[]> {
    return this.api.get<Subscription[]>('/subscriptions');
  }

  create(payload: CreateSubscriptionPayload): Observable<Subscription> {
    return this.api.post<Subscription, CreateSubscriptionPayload>('/subscriptions', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/subscriptions/${id}`);
  }
}

export interface CreateSubscriptionPayload {
  targetId: number;
}
