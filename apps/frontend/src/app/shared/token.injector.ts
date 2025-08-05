import { inject } from '@angular/core';
import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { from, switchMap } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const _authService = inject(AuthService);
  return from(_authService.asyncToken).pipe(
    // switchMap is used to handle the observable returned by next()
    switchMap(async (token) => {
      if (!token) {
        return token;
      }
      // Decode JWT token (payload only, without verifying signature)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      );
      console.log('Decoded JWT payload:', decodedPayload);
      if (!token || decodedPayload.exp < Date.now() / 1000) {
        const token = await _authService.userManager.signinRedirect();
        console.log('New token obtained:', token);
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
    })
  );
};
