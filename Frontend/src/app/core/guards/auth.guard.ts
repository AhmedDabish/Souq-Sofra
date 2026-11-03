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
  const rolesAllowed = !!role && (!allowed || allowed.includes(role));
  const permission = route.data?.['permission'] as string | undefined;
  const permissionAllowed = !permission || auth.hasPermission(permission);
  if (rolesAllowed && permissionAllowed) return true;
  const landing = [
    ['dashboard.view', '/admin'], ['orders.view', '/admin/orders'],
    ['products.view', '/admin/products'], ['categories.view', '/admin/categories'],
    ['addons.view', '/admin/addons'], ['settings.view', '/admin/settings'], ['users.view', '/admin/staff']
  ].find(([required]) => auth.hasPermission(required))?.[1];
  return router.createUrlTree(landing ? [landing] : ['/admin/login']);
};
