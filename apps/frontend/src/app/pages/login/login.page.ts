import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-surface-100 dark:bg-surface-900">
      <p-card class="w-full max-w-md">
        <ng-template pTemplate="header">
          <h2 class="text-center m-0">Login</h2>
        </ng-template>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="flex flex-col gap-4 mt-4">
          <span class="p-float-label">
            <input pInputText id="username" name="username" [(ngModel)]="username" required class="w-full" />
            <label for="username">Username</label>
          </span>
          <span class="p-float-label">
            <input pPassword id="password" name="password" [(ngModel)]="password" required class="w-full" />
            <label for="password">Password</label>
          </span>
          <button pButton type="submit" label="Login" class="w-full mt-2"></button>
          <button pButton type="button" class="w-full mt-2 p-button-outlined" (click)="goToSignup()">Sign Up with Referral</button>
        </form>
        <div *ngIf="loginError" class="text-red-500 text-center mt-4">Invalid credentials</div>
      </p-card>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      border-radius: 1rem;
    }
    .p-float-label {
      width: 100%;
    }
  `]
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
