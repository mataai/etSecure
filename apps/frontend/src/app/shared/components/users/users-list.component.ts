import { Component, input, output, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChipModule } from 'primeng/chip';

import { User } from '@etsecure/data-contracts';

@Component({
  selector: 'app-users-list',
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
      [value]="users() || []"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['name', 'email', 'groups']"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedUsers"
      [rowHover]="true"
      [paginator]="false"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Manage Users</h5>
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
          <th style="width: 12rem">ID</th>
          <th pSortableColumn="name" style="min-width:16rem">
            Name
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-user>
        <tr>
          <td style="width: 3rem">
            <!-- <p-tableCheckbox [value]="user.id" /> -->
          </td>
          <td style="min-width: 2rem">{{ user.authentik_id }}</td>
          <td style="min-width: 16rem">{{ user.name }}</td>
          <td style="min-width: 16rem">{{ user.email }}</td>
          <td>
            <p-button
              icon="pi pi-eye"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="viewUser.emit(user)"
            />
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              [rounded]="true"
              [outlined]="true"
              (click)="editUser.emit(user)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="deleteUser.emit(user)"
            />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class UsersListComponent {
  public selectedUsers?: User[];
  users = input<User[]>([]);
  public viewUser = output<User>();
  public editUser = output<User>();
  public deleteUser = output<User>();

  public onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  public findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.users().length; i++) {
      if (this.users()[i]._id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
}
