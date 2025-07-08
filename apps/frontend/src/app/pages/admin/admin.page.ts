import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, ButtonModule, SkeletonModule],
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-primary mb-2 text-center">Admin Panel</h1>
      <p-card class="mb-4 p-6">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-video text-2xl text-primary"></i>
            <span class="text-xl font-bold">Live Feed</span>
          </div>
        </ng-template>
        <div class="flex justify-center items-center min-h-[300px] bg-surface-100 rounded-lg border border-surface-200 p-6">
          <!-- Live video feed placeholder -->
          <ng-container *ngIf="liveFeedConnected; else noFeed">
            <video #videoFeed width="480" height="270" controls autoplay muted class="rounded shadow"></video>
          </ng-container>
          <ng-template #noFeed>
            <div class="flex flex-col items-center gap-2 text-surface-500">
              <i class="pi pi-exclamation-triangle text-4xl"></i>
              <span class="font-semibold">No live feed connection</span>
              <span class="text-xs">Waiting for backend connection...</span>
            </div>
          </ng-template>
        </div>
      </p-card>

      <p-card class="p-6">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-list text-2xl text-primary"></i>
            <span class="text-xl font-bold">Recent Logins</span>
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
  `]
})
export class AdminPage {
  liveFeedConnected = false; // Set to true when backend is connected
  logins = [
    // Example data, replace with backend data
    // { name: 'John', lastName: 'Doe', timestamp: new Date(), piName: 'PI-1', photo: 'https://randomuser.me/api/portraits/men/1.jpg' },
  ];
}
