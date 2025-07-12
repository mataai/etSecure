import { Component, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AttendanceService } from '../../shared/services/attendences.service';
import { Attendance } from '@etsecure/data-contracts';
import { AttendancesListComponent } from '../../shared/components/attendances/attendances-list.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, CardModule, AttendancesListComponent],
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto py-8">
      <h1
        class="text-3xl font-extrabold tracking-tight text-primary mb-2 text-center"
      >
        Admin Panel
      </h1>
      <p-card class="mb-4 p-6">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3">
            <i class="pi pi-video text-2xl text-primary"></i>
            <span class="text-xl font-bold">Live Feed</span>
          </div>
        </ng-template>
        <div
          class="flex justify-center items-center min-h-[300px] bg-surface-950 rounded-lg border border-surface-600 p-6"
        >
          <!-- Live video feed placeholder -->
          <ng-container *ngIf="liveFeedConnected; else noFeed">
            <video
              #videoFeed
              width="480"
              height="270"
              controls
              autoplay
              muted
              class="rounded shadow"
            ></video>
          </ng-container>
          <ng-template #noFeed>
            <div class="flex flex-col items-center gap-2 text-surface-100 ">
              <i class="pi pi-exclamation-triangle text-xl"></i>
              <span class="font-semibold text-xl">No live feed connection</span>
              <span class="text-s">Waiting for backend connection...</span>
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
        <app-attendances-list [attendances]="logins()"> </app-attendances-list>
      </p-card>
    </div>
  `,
})
export class AdminPage {
  liveFeedConnected = false; // Set to true when backend is connected
  logins = model<Attendance[]>([]);

  private _attendanceService = inject(AttendanceService);

  constructor() {
    // Load attendances when component initializes
    this._loadAttendances();
  }

  private async _loadAttendances() {
    try {
      const attendances = await this._attendanceService.getAllAttendances();
      console.log('Loaded attendances:', attendances);
      this.logins.set(attendances);
    } catch (error) {
      console.error('Failed to load attendances:', error);
    }
  }
}
