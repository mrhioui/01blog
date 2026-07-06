import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly api = inject(Api);
  private readonly tokenState = signal<string | null>(localStorage.getItem('blog_token'));
  private readonly userState = signal<User | null>(this.readStoredUser());

  readonly token = computed(() => this.tokenState());
  readonly currentUser = computed(() => this.userState());
  readonly isLoggedIn = computed(() => !!this.tokenState() && !!this.userState());

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginPayload>('/auth/login', payload);
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.api.post<User, RegisterPayload>('/auth/register', payload);
  }

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  searchUsers(query: string): Observable<User[]> {
    return this.api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  getUserProfile(id: number): Observable<User> {
    return this.api.get<User>(`/users/${id}/profile`);
  }

  updateCurrentUser(payload: UpdateProfilePayload): Observable<User> {
    const formData = new FormData();
    formData.append('username', payload.username);
    formData.append('email', payload.email);
    formData.append('profilePublic', String(payload.profilePublic));
    
    formData.append('headline', payload.headline ?? '');
    formData.append('location', payload.location ?? '');
    formData.append('about', payload.about ?? '');

    if (payload.profileImageFile) {
      formData.append('profileImage', payload.profileImageFile);
    }

    if (payload.bannerImageFile) {
      formData.append('bannerImage', payload.bannerImageFile);
    }

    return this.api.put<User, FormData>('/users/me', formData);
  }

  saveCurrentUser(user: User): void {
    localStorage.setItem('blog_user', JSON.stringify(user));
    this.userState.set(user);
  }

  saveSession(response: AuthResponse): void {
    localStorage.setItem('blog_token', response.token);
    localStorage.setItem('blog_user', JSON.stringify(response.user));
    this.tokenState.set(response.token);
    this.userState.set(response.user);
  }

  logout(): void {
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
    this.tokenState.set(null);
    this.userState.set(null);
  }

  private readStoredUser(): User | null {
    const storedUser = localStorage.getItem('blog_user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('blog_user');
      return null;
    }
  }
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  profileImageUrl?: string;
}

export interface UpdateProfilePayload {
  username: string;
  email: string;
  profilePublic: boolean;
  headline?: string | null;
  location?: string | null;
  about?: string | null;
  profileImageFile?: File | null;
  bannerImageFile?: File | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
