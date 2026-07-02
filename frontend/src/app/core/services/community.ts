import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private readonly api = inject(Api);

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users/community');
  }
}
