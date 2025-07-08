import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-surface-100 dark:bg-surface-900">
      <p-card class="w-full max-w-md">
        <ng-template pTemplate="header">
          <h2 class="text-center m-0">Sign Up with Referral</h2>
        </ng-template>
        <form (ngSubmit)="onSignup()" #signupForm="ngForm" class="flex flex-col gap-4 mt-4">
          <span class="p-float-label">
            <input pInputText id="username" name="username" [(ngModel)]="username" required class="w-full" />
            <label for="username">Username</label>
          </span>
          <span class="p-float-label">
            <input pInputText id="referral" name="referral" [(ngModel)]="referral" required class="w-full" />
            <label for="referral">Referral Code</label>
          </span>
          <span class="p-float-label">
            <input pPassword id="password" name="password" [(ngModel)]="password" required class="w-full" />
            <label for="password">Password</label>
          </span>
          <button pButton type="submit" class="w-full mt-2">Sign Up</button>
        </form>
        <div *ngIf="signupSuccess" class="text-green-500 text-center mt-4">Signup successful!</div>
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
export class SignupPage {
  username = '';
  referral = '';
  password = '';
  signupSuccess = false;

  private router = inject(Router);

  onSignup() {
    // Demo logic; replace with real signup
    this.signupSuccess = true;
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}
