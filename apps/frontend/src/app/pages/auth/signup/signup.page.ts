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
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-surface-100 dark:bg-surface-900">
      <header class="flex flex-col items-center pt-12 pb-4">
        <div class="flex items-center gap-3 mb-2">
          <i class="pi pi-user-plus text-4xl text-primary"></i>
          <h1 class="text-3xl font-bold tracking-tight text-primary">
            Join etSecure
          </h1>
        </div>
        <p class="text-lg text-surface-600 dark:text-surface-200">
          Create your account with a referral code
        </p>
      </header>
      <main class="flex flex-1 justify-center items-center mt-[-12rem]">
        <p-card class="w-full max-w-md">
          <ng-template pTemplate="header">
            <h2
              class="text-center m-0 text-2xl font-bold tracking-tight text-primary mb-1 signup-title"
            >
              Sign Up with Referral
            </h2>
          </ng-template>
          <form
            (ngSubmit)="onSignup()"
            #signupForm="ngForm"
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
            <span class="p-float-label">
              <input
                pInputText
                id="referral"
                name="referral"
                [(ngModel)]="referral"
                required
                class="w-full"
              />
              <label for="referral">Referral Code</label>
            </span>
            <!-- Face Photo Upload Section -->
            <div
              class="flex flex-col gap-2 bg-surface-50 dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700 mt-2"
            >
              <label
                for="facePhoto"
                class="font-semibold text-surface-700 dark:text-surface-100"
                >Upload a clear photo of your face
                <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                id="facePhoto"
                name="facePhoto"
                accept="image/*"
                (change)="onPhotoSelected($event)"
                required
                class="custom-file-input"
              />
              <div *ngIf="facePhotoPreview" class="flex justify-center mt-2">
                <img
                  [src]="facePhotoPreview"
                  alt="Face Preview"
                  class="max-h-64 rounded shadow border border-surface-300 dark:border-surface-600"
                  style="max-width: 100%; object-fit: contain;"
                />
              </div>
              <div *ngIf="photoError" class="text-red-500 text-sm mt-1">
                A face photo is required.
              </div>
            </div>
            <button pButton type="submit" class="w-full mt-2">Sign Up</button>
          </form>
          <div *ngIf="signupSuccess" class="text-green-500 text-center mt-4">
            Signup successful!
          </div>
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
      .signup-title {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      .custom-file-input::-webkit-file-upload-button {
        background: var(--primary-color, #10b981);
        color: #fff;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .custom-file-input::-webkit-file-upload-button:hover {
        background: var(--primary-color-dark, #059669);
      }
      .custom-file-input::file-selector-button {
        background: var(--primary-color, #10b981);
        color: #fff;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .custom-file-input::file-selector-button:hover {
        background: var(--primary-color-dark, #059669);
      }
      .custom-file-input {
        color: #374151;
        background: transparent;
        font-size: 1rem;
      }
      /* Fix form overlap with header when image is added */
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
export class SignupPage {
  username = '';
  referral = '';
  password = '';
  facePhoto: File | null = null;
  facePhotoPreview: string | null = null;
  photoError = false;
  signupSuccess = false;

  private router = inject(Router);

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.facePhoto = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.facePhotoPreview = (e.target as FileReader).result as string;
      };
      reader.readAsDataURL(this.facePhoto);
      this.photoError = false;
    } else {
      this.facePhoto = null;
      this.facePhotoPreview = null;
    }
  }

  onSignup() {
    if (!this.facePhoto) {
      this.photoError = true;
      return;
    }
    // Demo logic; replace with real signup
    this.signupSuccess = true;
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}
