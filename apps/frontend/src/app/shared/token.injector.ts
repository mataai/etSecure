import { inject } from '@angular/core';
import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { from, switchMap } from 'rxjs';
import { isTokenExpired } from './utils/token-expiry-checker';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
) => {
  const _authService = inject(AuthService);
  return from(_authService.asyncToken).pipe(
    // switchMap is used to handle the observable returned by next()
    switchMap(async (token) => {
      const tokenExpired = isTokenExpired(token);
      if (tokenExpired) {
        await _authService.userManager.signinRedirect();
      }
      return token;
    }),
    switchMap((token) => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token,
        },
      });
      return next(authReq);
    }),
  );
};
