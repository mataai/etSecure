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
          <th pSortableColumn="name" style="min-width:16rem">
            Name
            <p-sortIcon field="name" />
          </th>
          <th pSortableColumn="type" style="min-width:10rem">
            Type
            <p-sortIcon field="type" />
          </th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-serviceAccount>
        <tr>
          <td style="width: 3rem"></td>
          <td style="min-width: 16rem">{{ serviceAccount.name }}</td>
          <td style="min-width: 10rem">{{ serviceAccount.type }}</td>
          <td>
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
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ServiceAccountsListComponent {
  public selectedServiceAccounts?: ServiceAccount[];
  serviceAccounts = input<ServiceAccount[]>([]);
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
      if (this.serviceAccounts()[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }
}
