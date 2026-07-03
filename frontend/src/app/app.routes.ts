import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth-guard';
import { AdminDashboardPage } from './features/admin/pages/admin-dashboard/admin-dashboard';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { CommunityDirectoryPage } from './features/community/pages/community-directory/community-directory';
import { NotificationsCenterPage } from './features/notifications/pages/notifications-center/notifications-center';
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
  { path: 'community', component: CommunityDirectoryPage, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsCenterPage, canActivate: [authGuard] },
  { path: 'posts/:id', component: PostDetails, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfilePage, canActivate: [authGuard] },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
