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
    <div class="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <p-card class="p-6 w-full max-w-md">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-user text-2xl text-primary"></i>
            <span class="text-xl font-bold">My Profile</span>
          </div>
        </ng-template>
        <div class="flex flex-col items-center gap-4 mt-4">
          <ng-container *ngIf="profile; else loading">
            <img *ngIf="profile.photo; else photoSkeleton" [src]="profile.photo" alt="Profile Photo" class="w-24 h-24 rounded-full object-cover border" />
            <ng-template #photoSkeleton>
              <p-skeleton shape="circle" size="6rem"></p-skeleton>
            </ng-template>
            <div class="text-center">
              <div class="text-lg font-semibold">{{ profile.name }} {{ profile.lastName }}</div>
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
  styles: [``]
})
export class ProfilePage {
  private _authService = inject(AuthService);
  public profile: any = null;

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.profile = profile;
      });
    });
  }
}
