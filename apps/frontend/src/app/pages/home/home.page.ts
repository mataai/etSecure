import { Component, effect, inject, model } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../shared/services/auth.service';
import { AttendanceService } from '../../shared/services';
import { Attendance } from '@etsecure/data-contracts';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    SkeletonModule,
    ChipModule,
    TagModule,
  ],
  standalone: true,
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8 mt-24 relative">
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">
          Welcome
        </span>
        <span class="text-3xl font-extrabold tracking-tight text-white">
          {{ name }}
        </span>
      </div>
      <p-card class="p-6">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-list text-2xl text-primary"></i>
            <span class="text-xl font-bold">My Logins</span>
          </div>
        </ng-template>
        <p-table
          [value]="this.attendances()"
          class="mt-4"
          [responsiveLayout]="'scroll'"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Timestamp</th>
              <th>Room</th>
              <th>Location</th>
              <th>Type</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-login>
            <tr>
              <td>{{ this.toDate(login.timestamp) }}</td>
              <td>{{ login.room.name }}</td>
              <td>{{ login.room.location }}</td>
              <td>
                @if (login.type === 'bypass') {
                  <p-tag
                    icon="pi pi-exclamation-triangle"
                    severity="error"
                    value="Bypass"
                  />
                } @else {
                  <p-tag
                    icon="pi pi-lock-open"
                    severity="info"
                    value="Unlock"
                  />
                }
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center text-surface-500">
                No login data available
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      <div class="flex justify-end mt-8">
        <a
          [routerLink]="['/bypass']"
          href="/bypass"
          role="button"
          tabindex="0"
          class="px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-700 transition-all font-semibold text-lg cursor-pointer"
        >
          Backup Unlock Request
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-card {
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
        border-radius: 1rem;
      }
    `,
  ],
})
export class HomePage {
  private _authService = inject(AuthService);
  private _attendanceService = inject(AttendanceService);
  public name = '';
  public attendances = model<Attendance[]>([]); // Specify the model type
  public toDate = (UTCTimestamp: number) =>
    new DatePipe('en-Us').transform(UTCTimestamp, 'short', 'America/Toronto');
  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.name = profile.name || 'User';
      });
      this.fetchLogins();
    });
  }

  private async fetchLogins() {
    const me = await this._authService.getMe();
    this._attendanceService.getUserAttendances(me._id!).then((attendances) => {
      this.attendances.set(attendances);
    });
  }
}
