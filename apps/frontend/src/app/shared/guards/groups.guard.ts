import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const groupsGuard: (groups: string[]) => CanActivateFn = (groups) => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const profile = await authService.getProfile();
    const userGroups = profile?.groups || [];
    const hasRequiredGroup = userGroups.some((grp) => groups.includes(grp));
    return hasRequiredGroup || router.createUrlTree(['/auth/login']);
  };
};
