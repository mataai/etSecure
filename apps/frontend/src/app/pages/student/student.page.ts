import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, ButtonModule, SkeletonModule],
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-primary mb-2 text-center">Student Panel</h1>
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
  `]
})
export class StudentPage {
  logins = [
    // Example data, replace with backend data filtered for the current user
    // { name: 'Jane', lastName: 'Smith', timestamp: new Date(), piName: 'PI-2', photo: 'https://randomuser.me/api/portraits/women/2.jpg' },
  ];
}
