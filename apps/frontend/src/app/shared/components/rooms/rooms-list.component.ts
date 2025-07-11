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
      [tableStyle]="{ 'min-width': '75rem' }"
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
          <th style="width: 3rem">
            <!-- <p-tableHeaderCheckbox /> -->
          </th>
          <th pSortableColumn="name" style="min-width:16rem">
            Name
            <p-sortIcon field="email" />
          </th>
          <th pSortableColumn="location">Location</th>
          <th pSortableColumn="groups" style="min-width: 8rem">
            Allowed Members
            <p-sortIcon field="groups" />
          </th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-room>
        <tr>
          <td style="width: 3rem">
            <!-- <p-tableCheckbox [value]="room.id" /> -->
          </td>
          <td style="min-width: 16rem">{{ room.name }}</td>
          <td style="min-width: 16rem">{{ room.location }}</td>
          <td style="min-width: 16rem">
            @for(user of room.users; track user) {
            <p-chip
              [label]="user.name"
              [styleClass]="'mr-2'"
              [removable]="false"
            />
            }
          </td>
          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="editRoom.emit(room)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="deleteRoom.emit(room)"
            />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class RoomsListComponent {
  public selectedRooms?: Room[];
  rooms = input<Room[]>([]);
  public editRoom = output<Room>();
  public deleteRoom = output<Room>();

  @ViewChild('dt') dt!: Table;

  public onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  public findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.rooms().length; i++) {
      if (this.rooms()[i]._id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
}
