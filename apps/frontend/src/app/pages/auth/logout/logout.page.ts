import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  template: `
    <div class="flex flex-col min-h-screen bg-surface-100 dark:bg-surface-900">
      <header class="flex flex-col items-center pt-12 pb-4">
        <div class="flex items-center gap-3 mb-2">
          <i class="pi pi-user text-4xl text-primary"></i>
          <h1 class="text-3xl font-bold tracking-tight text-primary">
            You are being logged out of etSecure.
          </h1>
        </div>
        <p class="text-lg text-surface-600 dark:text-surface-200">
          Please wait while we log you out.
        </p>
      </header>
    </div>
  `,
})
export class LogoutPage implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.logout();
  }
}
