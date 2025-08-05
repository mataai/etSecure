import { Component, input, output, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChipModule } from 'primeng/chip';

import { Room } from '@etsecure/data-contracts';

@Component({
  selector: 'app-rooms-list',
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
      dataKey="_id"
      [value]="rooms() || []"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['name', 'location', 'members.name']"
      [(selection)]="selectedRooms"
      [rowHover]="true"
      [paginator]="false"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Manage Rooms</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              pInputText
              type="text"
              (input)="onGlobalFilter(dt, $event)"
              placeholder="Search..."
            />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="name">
            Name
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="location">
            Location
            <p-sortIcon field="location" />
          </th>
          <th class="hidden sm:table-cell">Allowed Members</th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-room>
        <tr>
          <td>{{ room.name }}</td>
          <td>{{ room.location }}</td>
          <td class="hidden sm:table-cell">
            @for (user of room.users; track user) {
              <p-chip
                [label]="user.name"
                [styleClass]="'mr-2'"
                [removable]="false"
              />
            }
          </td>
          <td>
            <div class="flex justify-end ">
              <p-button
                icon="pi pi-eye"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="viewRoom.emit(room)"
              />
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="editRoom.emit(room)"
              />
              <p-button
                icon="pi pi-trash"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteRoom.emit(room)"
              />
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class RoomsListComponent {
  public selectedRooms?: Room[];
  public rooms = input<Room[]>([]);
  public viewRoom = output<Room>();
  public editRoom = output<Room>();
  public deleteRoom = output<Room>();

  @ViewChild('dt') dt!: Table;

  public onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
