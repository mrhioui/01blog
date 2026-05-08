import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth-guard';
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard/admin-dashboard';
import { AdminUsersPage } from './features/admin/pages/admin-users-page/admin-users-page';
import { AdminPostsPage } from './features/admin/pages/admin-posts-page/admin-posts-page';
import { AdminReportsPage } from './features/admin/pages/admin-reports-page/admin-reports-page';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Feed } from './features/posts/pages/feed/feed';
import { PostDetails } from './features/posts/pages/post-details/post-details';
import { ProfilePage } from './features/profile/pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Feed },
  { path: 'admin', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'admin/posts', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'admin/reports', component: AdminDashboardPage, canActivate: [adminGuard] },
  { path: 'login', component: Login },
  { path: 'posts/:id', component: PostDetails, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfilePage, canActivate: [authGuard] },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
