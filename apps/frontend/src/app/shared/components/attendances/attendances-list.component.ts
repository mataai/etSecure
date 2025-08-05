import { Component, input, model, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChipModule } from 'primeng/chip';

import { Attendance } from '@etsecure/data-contracts';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AttendancesDetailsDialog } from './attendance-details.dialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-attendances-list',
  imports: [
    TableModule,
    ButtonModule,
    ChipModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    CommonModule,
    DialogModule,
    AttendancesDetailsDialog,
    TagModule,
  ],
  template: `
    <p-table
      #dt
      dataKey="id"
      [value]="attendances() || []"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['name', 'room']"
      [rowHover]="true"
      [paginator]="false"
      [scrollable]="true"
      scrollHeight="40vh"
    >
      <ng-template #header>
        <tr>
          <th pSortableColumn="user">
            User
            <p-sortIcon field="user" />
          </th>
          <th pSortableColumn="room">
            Room
            <p-sortIcon field="room" />
          </th>
          <th pSortableColumn="building" class="hidden sm:table-cell">
            Building
            <p-sortIcon field="building" />
          </th>
          <th pSortableColumn="timestamp">
            Timestamp
            <p-sortIcon field="timestamp" />
          </th>
          <th>Type</th>
        </tr>
      </ng-template>
      <ng-template #body let-attendance>
        <tr (click)="openInfo(attendance)">
          <td>{{ attendance.user.name }}</td>
          <td>{{ attendance.room.name }}</td>
          <td class="hidden sm:table-cell">{{ attendance.room.location }}</td>
          <td class="hidden sm:table-cell">
            {{ attendance.timestamp | date: 'medium' }}
          </td>
          <td class="sm:hidden">{{ attendance.timestamp | date: 'short' }}</td>
          <td>
            @if (attendance.type === 'bypass') {
              @if (smallScreen) {
                <p-tag
                  icon="pi pi-exclamation-triangle"
                  severity="error"
                  value="Bypass"
                />
              } @else {
                <p-tag icon="pi pi-exclamation-triangle" severity="error" />
              }
            } @else {
              @if (smallScreen) {
                <p-tag icon="pi pi-lock-open" severity="info" value="Unlock" />
              } @else {
                <p-tag icon="pi pi-lock-open" severity="info" />
              }
            }
          </td>
        </tr>
      </ng-template>
    </p-table>

    <app-attendances-details-dialog
      [data]="selectedAttendance()"
      (closeEvent)="selectedAttendance.set(null)"
    ></app-attendances-details-dialog>
  `,
})
export class AttendancesListComponent {
  public attendances = input<Attendance[]>([]);
  public selectedAttendance = model<Attendance | null>();
  @ViewChild('dt') dt!: Table;

  public smallScreen = window.innerWidth < 470;

  public openInfo(attendance: Attendance) {
    // Logic to open a dialog or modal with attendance details
    this.selectedAttendance.set(attendance);
  }
}
