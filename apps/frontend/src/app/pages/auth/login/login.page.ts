import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, RouterModule],
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
            <!-- <span class="p-float-label">
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
            </span> -->
            <button pButton type="submit" class="w-full mt-2">Login</button>
            <button
              pButton
              type="button"
              class="w-full mt-2 p-button-outlined"
              [routerLink]="['/auth/register']"
              routerLinkActive="router-link-active"
            >
              Sign Up with Referral
            </button>
          </form>
        </p-card>
      </main>
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
  private authService = inject(AuthService);

  onLogin() {
    this.authService.login();
  }
}
