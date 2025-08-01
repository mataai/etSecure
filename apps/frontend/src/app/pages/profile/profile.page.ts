import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../shared/services/auth.service';
import { UsersService } from '../../shared/services/users.service';
import { UserAuthentik } from '@etsecure/data-contracts';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, CardModule, SkeletonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div
      class="flex flex-col items-center justify-center min-h-[60vh] py-8 mt-24"
    >
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">
          My Profile
        </span>
      </div>
      <p-card class="p-6 w-full max-w-md">
        <div class="flex flex-col items-center gap-4 mt-4">
          <ng-container *ngIf="profile; else loading">
            <!-- <img
              *ngIf="profile.photo; else photoSkeleton"
              [src]="profile.photo"
              alt="Profile Photo"
              class="w-40 h-40 rounded-full object-cover border"
            />
            <ng-template #photoSkeleton>
              <p-skeleton shape="circle" size="6rem"></p-skeleton>
            </ng-template> -->
            <div class="w-full mt-4">
              <label
                for="profile-name"
                class="block text-sm font-medium text-surface-500 mb-1"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                class="w-full p-2 rounded bg-surface-100 border border-surface-300 text-black placeholder:text-black"
                [value]="profile.name"
                readonly
              />
            </div>
            <div class="w-full mt-2">
              <label
                for="profile-upload"
                class="block text-sm font-medium text-surface-500 mb-1"
              >
                Change Profile Picture
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
                class="custom-file-input"
                capture="user"
              />
              <div
                *ngIf="selectedFilePreview"
                class="flex flex-col items-center mt-4"
              >
                <span class="text-sm text-surface-500 mb-2">Preview:</span>
                <img
                  [src]="selectedFilePreview"
                  alt="Selected Preview"
                  class="w-40 h-40 rounded-full object-cover border"
                />
              </div>
              <button
                class="px-4 py-2 bg-primary text-white rounded block mx-auto mt-6 hover:bg-primary-700 transition-all font-semibold"
                (click)="uploadPicture()"
                [disabled]="!selectedFile || uploadStatus === 'processing'"
              >
                Upload
              </button>
              @if (uploadStatus !== 'idle') {
              <div class="text-center mt-2 min-h-[1.5rem]">
                <span
                  *ngIf="uploadStatus === 'processing'"
                  class="text-surface-500"
                >
                  Uploading...
                </span>
                <span *ngIf="uploadStatus === 'success'" class="text-green-500">
                  Successfully updated!
                </span>
                <span *ngIf="uploadStatus === 'error'" class="text-red-500">
                  Upload failed.
                </span>
              </div>
              }
            </div>
          </ng-container>
          <ng-template #loading>
            <p-skeleton width="100%" height="2rem"></p-skeleton>
            <p-skeleton width="60%" height="1.5rem"></p-skeleton>
          </ng-template>
        </div>
      </p-card>
    </div>
    <button
      class="mt-8 w-4/5 max-w-md py-4 text-lg bg-primary text-white rounded block mx-auto hover:bg-primary-700 transition-all font-bold shadow-lg"
      (click)="logout()"
    >
      Logout
    </button>
    <p-toast />
  `,
  styles: [
    `
      .custom-file-input {
        color: white;
      }
      .custom-file-input::file-selector-button {
        color: #fff;
        background: var(--primary-color, #10b981);
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
    `,
  ],
})
export class ProfilePage {
  private _authService = inject(AuthService);
  private _usersService = inject(UsersService);
  private _messageService = inject(MessageService);
  private _router = inject(Router);
  public profile: (UserAuthentik & { photo: string }) | null = null;
  public selectedFile: File | null = null;
  public selectedFilePreview: string | null = null;
  public uploadStatus: 'idle' | 'processing' | 'success' | 'error' = 'idle';

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.profile = profile as UserAuthentik & { photo: string };
      });
    });
  }

  public onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.selectedFilePreview = null;
    }
  }

  async uploadPicture() {
    if (!this.selectedFile) return;
    this.uploadStatus = 'processing';
    try {
      await this._usersService.updateSelfPicture(this.selectedFile);
      this.uploadStatus = 'success';
      this._authService.getProfile().then((profile) => {
        this.profile = profile as UserAuthentik & { photo: string };
      });
      setTimeout(() => {
        this.uploadStatus = 'idle';
      }, 2000);
    } catch (error: any) {
      this.uploadStatus = 'error';
      this._messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'There was an error uploading your profile picture.',
      });
      setTimeout(() => {
        this.uploadStatus = 'idle';
      }, 2000);
    }
  }

  async logout() {
    this._router.navigate(['/auth/logout']);
  }
}
