import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.model';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Subscriptions {
  private readonly api = inject(Api);

  create(payload: CreateSubscriptionPayload): Observable<Subscription> {
    return this.api.post<Subscription, CreateSubscriptionPayload>('/subscriptions', payload);
  }

  delete(targetId: number): Observable<void> {
    return this.api.delete<void>(`/subscriptions/${targetId}`);
  }
}

export interface CreateSubscriptionPayload {
  targetId: number;
}
