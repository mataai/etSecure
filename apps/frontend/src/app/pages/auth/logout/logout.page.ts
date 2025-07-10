import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LayoutService } from '../../../layout/service/layout.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
  ],
  providers: [LayoutService],
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
      <footer
        class="w-full text-center py-6 mt-8 text-surface-500 dark:text-surface-300 bg-surface-0 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700"
        *ngIf="false"
      >
        <div class="flex flex-col items-center gap-2">
          <span>
            Need help?
            <a href="mailto:admin@example.com" class="text-primary underline">
              Contact admin
            </a>
          </span>
          <span class="text-xs">
            &copy; 2025 etSecure. All rights reserved.</span
          >
        </div>
      </footer>
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
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.logout();
  }
}
