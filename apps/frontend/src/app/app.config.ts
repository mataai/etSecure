import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import {
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { definePreset } from '@primeuix/themes';
import { tokenInterceptor } from './shared/token.injector';

export const appConfig = {
  providers: [
    provideRouter(appRoutes),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              '50': '#fff1f2',
              '100': '#ffe4e6',
              '200': '#fecdd3',
              '300': '#fda4af',
              '400': '#fb7185',
              '500': '#f43f5e',
              '600': '#e11d48',
              '700': '#be123c',
              '800': '#9f1239',
              '900': '#881337',
              '950': '#4c0519',
            },
          },
        }),
      },
    }),
  ],
};
