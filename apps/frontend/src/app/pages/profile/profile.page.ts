import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] py-8 mt-24">
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">My Profile</span>
      </div>
      <p-card class="p-6 w-full max-w-md">
        <div class="flex flex-col items-center gap-4 mt-4">
          <ng-container *ngIf="profile; else loading">
            <img
              *ngIf="profile.photo; else photoSkeleton"
              [src]="profile.photo"
              alt="Profile Photo"
              class="w-24 h-24 rounded-full object-cover border"
            />
            <ng-template #photoSkeleton>
              <p-skeleton shape="circle" size="6rem"></p-skeleton>
            </ng-template>
            <div class="w-full mt-4">
              <label for="profile-name" class="block text-sm font-medium text-surface-500 mb-1">Full Name</label>
              <input id="profile-name" type="text" class="w-full p-2 rounded bg-surface-100 border border-surface-300 text-black placeholder:text-black" [value]="profile.name" readonly />
            </div>
            <div class="w-full mt-2">
              <label for="profile-upload" class="block text-sm font-medium text-surface-500 mb-1">Change Profile Picture</label>
              <input id="profile-upload" type="file" accept="image/*" (change)="onFileSelected($event)" class="custom-file-input" />
              <button class="px-4 py-2 bg-primary text-white rounded block mx-auto mt-6" (click)="uploadPicture()" [disabled]="!selectedFile">Upload</button>
            </div>
          </ng-container>
          <ng-template #loading>
            <p-skeleton width="100%" height="2rem"></p-skeleton>
            <p-skeleton width="60%" height="1.5rem"></p-skeleton>
          </ng-template>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .custom-file-input {
      color: white;
    }
    .custom-file-input::file-selector-button {
      color: black;
      background: #eee;
      border: 1px solid #888;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
    }
  `],
})
export class ProfilePage {
  private _authService = inject(AuthService);
  public profile: any = null;
  public selectedFile: File | null = null;

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.profile = profile;
      });
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  uploadPicture() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    fetch('/api/auth/picture', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          // Optionally refresh profile photo
          this._authService.getProfile().then((profile) => {
            this.profile = profile;
          });
        } else {
          alert('Failed to upload image');
        }
      })
      .catch(() => alert('Failed to upload image'));
  }
}
