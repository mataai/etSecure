import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback-page',
  template: `
    <div class="flex flex-col min-h-screen bg-surface-100 dark:bg-surface-900">
      <header class="flex flex-col items-center pt-12 pb-4">
        <div class="flex items-center gap-3 mb-2">
          <i class="pi pi-user text-4xl text-primary"></i>
          <h1 class="text-3xl font-bold tracking-tight text-primary">
            Welcome to etSecure
          </h1>
        </div>
        <p class="text-lg text-surface-600 dark:text-surface-200">
          Please wait while we process your login
        </p>
      </header>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-card {
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
        border-radius: 1rem;
      }
      .p-float-label {
        width: 100%;
      }
      .login-title {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      main.flex-1 {
        margin-top: 0 !important;
        padding-top: 2rem;
        padding-bottom: 2rem;
        align-items: flex-start;
      }
      @media (max-width: 640px) {
        main.flex-1 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
      }
    `,
  ],
})
export class CallbackPage implements OnInit {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  ngOnInit(): void {
    this._authService.handleCallback();

    setTimeout(() => {
      this._router.navigate(['/home']);
    }, 5000);
  }
}
