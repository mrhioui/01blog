import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth-guard';
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard/admin-dashboard';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Feed } from './features/posts/pages/feed/feed';
import { ProfilePage } from './features/profile/pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Feed },
  { path: 'admin/dashboard', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'login', component: Login },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfilePage, canActivate: [authGuard] },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
