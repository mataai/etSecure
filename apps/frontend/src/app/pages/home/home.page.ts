
import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, CardModule, TableModule, ButtonModule, SkeletonModule, NavbarComponent],
  standalone: true,
  template: `
    <app-navbar [items]="navbarItems"></app-navbar>
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8 mt-24">
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">Welcome </span>
        <span class="text-3xl font-extrabold tracking-tight text-white">{{ name }}</span>
      </div>
      <p-card class="p-6">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-list text-2xl text-primary"></i>
            <span class="text-xl font-bold">My Logins</span>
          </div>
        </ng-template>
        <p-table [value]="logins" class="mt-4" [responsiveLayout]="'scroll'">
          <ng-template pTemplate="header">
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Last Name</th>
              <th>Timestamp</th>
              <th>PI Name</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-login>
            <tr>
              <td>
                <img *ngIf="login.photo; else photoSkeleton" [src]="login.photo" alt="photo" class="w-12 h-12 rounded-full object-cover border" />
                <ng-template #photoSkeleton>
                  <p-skeleton shape="circle" size="3rem"></p-skeleton>
                </ng-template>
              </td>
              <td>{{ login.name }}</td>
              <td>{{ login.lastName }}</td>
              <td>{{ login.timestamp | date:'short' }}</td>
              <td>{{ login.piName }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center text-surface-500">No login data available</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      <a routerLink="" class="text-primary hover:underline">← Back</a>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      border-radius: 1rem;
    }
  `],
})
export class HomePage {
  public navbarItems = [
    {
      id: 'dashboard-link',
      icon: 'pi pi-home',
      routerLink: '/home',
    },
    {
      id: 'settings-link',
      icon: 'pi pi-cog',
      routerLink: '/admin/settings',
    },
    {
      id: 'profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
  ];

  private _authService = inject(AuthService);
  public name = '';
  logins = [
  ];

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.name = profile.name || 'User';
      });
    });
  }
}
