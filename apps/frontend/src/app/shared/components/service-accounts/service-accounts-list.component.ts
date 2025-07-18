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
          <th style="width: 3rem"></th>
          <th pSortableColumn="name" style="width:16rem">
            Name
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="type" style="width:8rem; text-align: center">
            Type
            <p-sortIcon field="type" />
          </th>
          <th pSortableColumn="room.name" style="width: 8rem; text-align: center">
            Room
            <p-sortIcon field="room.name" />
          </th>
          <th pSortableColumn="tokens" style="width: 8rem; text-align: center">
            Tokens
            <p-sortIcon field="tokens" />
          </th>

          <th style="min-width: 18rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-serviceAccount>
        <tr>
          <td style="width: 3rem"></td>
          <td style="min-width: 16rem">{{ serviceAccount.name }}</td>
          <td style="min-width: 8rem; text-align: center">
            @if (serviceAccount.type === 'pi') {
            <span class="text-blue-500">Auth Device</span>
            } @else {
            <span class="text-green-500">AI Service</span>}
          </td>
          <td style="min-width: 8rem; text-align: center">
            {{ serviceAccount.room?.name }}
          </td>
          <td style="width: 4rem; text-align: center">
            {{ serviceAccount.tokens || 0 }}
          </td>
          <td style="width: 20rem">
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
                severity="danger"
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
