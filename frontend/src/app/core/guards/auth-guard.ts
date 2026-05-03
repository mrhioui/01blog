import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url },
  });
};

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(Auth);
  const router = inject(Router);
  const currentUser = authService.currentUser();

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  if (currentUser?.role === 'ROLE_ADMIN') {
    return true;
  }

  return router.createUrlTree(['/']);
};
