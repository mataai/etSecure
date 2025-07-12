import { Component, input, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChipModule } from 'primeng/chip';

import { Attendance } from '@etsecure/data-contracts';

@Component({
  selector: 'app-attendances-list',
  imports: [
    TableModule,
    ButtonModule,
    ChipModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
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
    >
      <ng-template #header>
        <tr>
          <th style="width: 1rem"></th>
          <th style="min-width: 4rem">ID</th>
          <th pSortableColumn="user" style="min-width:12rem">
            User
            <p-sortIcon field="user" />
          </th>
          <th pSortableColumn="room" style="min-width: 12rem">
            Room
            <p-sortIcon field="room" />
          </th>
          <th pSortableColumn="timestamp" style="min-width: 8rem">
            Timestamp
            <p-sortIcon field="timestamp" />
          </th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-attendance>
        <tr>
          <td style="width: 3rem"></td>
          <td style="min-width: 12rem">{{ attendance._id }}</td>
          <td style="min-width: 16rem">{{ attendance.userId }}</td>
          <td style="min-width: 16rem">{{ attendance.roomId }}</td>
          <td style="min-width: 16rem">{{ attendance.timestamp }}</td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class AttendancesListComponent {
  attendances = input<Attendance[]>([]);

  @ViewChild('dt') dt!: Table;
}
