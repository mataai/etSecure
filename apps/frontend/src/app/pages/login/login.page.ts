import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
  selector: 'app-login-page',imports: [
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
          Please log in to continue
        </p>
      </header>
      <main class="flex flex-1 justify-center items-center">
        <p-card class="w-full max-w-md">
          <ng-template pTemplate="header">
            <h2
              class="text-center m-0 text-2xl font-bold tracking-tight text-primary mb-1 login-title"
            >
              Login
            </h2>
          </ng-template>
          <form
            (ngSubmit)="onLogin()"
            #loginForm="ngForm"
            class="flex flex-col gap-4 mt-4"
          >
            <span class="p-float-label">
              <input
                pInputText
                id="username"
                name="username"
                [(ngModel)]="username"
                required
                class="w-full"
              />
              <label for="username">Username</label>
            </span>
            <span class="p-float-label">
              <input
                pPassword
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="w-full"
              />
              <label for="password">Password</label>
            </span>
            <button pButton type="submit" class="w-full mt-2">Login</button>
            <button
              pButton
              type="button"
              class="w-full mt-2 p-button-outlined"
              (click)="goToSignup()"
            >
              Sign Up with Referral
            </button>
          </form>
          <div *ngIf="loginError" class="text-red-500 text-center mt-4">
            Invalid credentials
          </div>
        </p-card>
      </main>
      <footer
        class="w-full text-center py-6 mt-8 text-surface-500 dark:text-surface-300 bg-surface-0 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700"
        *ngIf="false"
      >
        <div class="flex flex-col items-center gap-2">
          <span
            >Need help?
            <a href="mailto:admin@example.com" class="text-primary underline"
              >Contact admin</a
            ></span
          >
          <span class="text-xs"
            >&copy; 2025 etSecure. All rights reserved.</span
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
export class LoginPage {
  username = '';
  password = '';
  loginError = false;

  private router = inject(Router);

  onLogin() {
    // Simple demo logic; replace with real authentication
    if (this.username === 'admin' && this.password === 'admin') {
      this.router.navigate(['/home']);
    } else {
      this.loginError = true;
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
