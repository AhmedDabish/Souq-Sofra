import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.currentUser()?.role;
  const allowed = route.data?.['roles'] as string[] | undefined;
  if (role && (!allowed || allowed.includes(role))) return true;
  return router.createUrlTree(role === 'User' ? ['/admin/orders'] : role ? ['/admin'] : ['/admin/login']);
};
