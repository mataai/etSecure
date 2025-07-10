import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const GroupsGuard: (groups: string[]) => CanActivateFn = (groups) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return async () =>
    (await authService.getProfile())?.groups.some((grp) =>
      groups.includes(grp)
    ) || router.createUrlTree(['/auth/login']);
};
