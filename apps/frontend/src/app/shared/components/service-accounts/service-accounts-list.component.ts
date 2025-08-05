import { Component, input, output, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChipModule } from 'primeng/chip';

import { ServiceAccount } from '@etsecure/data-contracts';

@Component({
  selector: 'app-service-accounts-list',
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
      [value]="serviceAccounts() || []"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['name', 'type']"
      [tableStyle]="{ 'min-width': '40rem' }"
      [(selection)]="selectedServiceAccounts"
      [rowHover]="true"
      [paginator]="false"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Manage Service Accounts</h5>
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
          <th pSortableColumn="type">
            Type
            <p-sortIcon field="type" />
          </th>
          <th pSortableColumn="room.name">
            Room
            <p-sortIcon field="room.name" />
          </th>
          <th pSortableColumn="tokens">
            Tokens
            <p-sortIcon field="tokens" />
          </th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-serviceAccount>
        <tr>
          <td>{{ serviceAccount.name }}</td>
          <td>
            @if (serviceAccount.type === 'pi') {
              <span class="text-blue-500">Auth Device</span>
            } @else {
              <span class="text-green-500">AI Service</span>
            }
          </td>
          <td>
            {{ serviceAccount.room?.name }}
          </td>
          <td>
            {{ serviceAccount.tokens || 0 }}
          </td>
          <td>
            <div class="flex justify-center">
              <p-button
                icon="pi pi-eye"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="viewServiceAccount.emit(serviceAccount)"
              />
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="editServiceAccount.emit(serviceAccount)"
              />
              <p-button
                icon="pi pi-trash"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteServiceAccount.emit(serviceAccount)"
              />
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ServiceAccountsListComponent {
  public selectedServiceAccounts?: ServiceAccount[];
  public serviceAccounts = input<ServiceAccount[]>([]);
  public viewServiceAccount = output<ServiceAccount>();
  public editServiceAccount = output<ServiceAccount>();
  public deleteServiceAccount = output<ServiceAccount>();

  @ViewChild('dt') dt!: Table;

  public onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  public findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.serviceAccounts().length; i++) {
      if (this.serviceAccounts()[i]._id === id) {
        index = i;
        break;
      }
    }
    return index;
  }
}
