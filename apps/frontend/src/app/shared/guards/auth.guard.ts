import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: (needsLogin?: boolean) => CanActivateFn = (
  needsLogin = true
) => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isAuthed = await authService.isAuthenticated();
    console.log('isAuthed', isAuthed);
    console.log('needsLogin', needsLogin);
    return needsLogin == isAuthed || router.createUrlTree(['/auth/login']);
  };
};
