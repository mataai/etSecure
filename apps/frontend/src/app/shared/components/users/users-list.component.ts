import {
  Component,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChipModule } from 'primeng/chip';
import { Subscription } from 'rxjs';

import { User } from '@etsecure/data-contracts';

import { UsersService } from '../../services/users.service';
import { UserFormComponent } from './user-create.component';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ChipModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, UsersService, ConfirmationService, DialogService],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="openNew()"
        />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="users() || []"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="[
        'name',
        'country.name',
        'representative.name',
        'status'
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedUsers"
      [rowHover]="true"
      dataKey="id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
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
            <p-tableHeaderCheckbox />
          </th>
          <th style="min-width: 16rem">ID</th>
          <th pSortableColumn="name" style="min-width:16rem">
            Name
            <p-sortIcon field="email" />
          </th>
          <th pSortableColumn="email">Email</th>
          <th pSortableColumn="groups" style="min-width: 8rem">
            Groups
            <p-sortIcon field="groups" />
          </th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-user>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="user" />
          </td>
          <td style="min-width: 12rem">{{ user.authentik_id }}</td>
          <td style="min-width: 16rem">{{ user.name }}</td>
          <td style="min-width: 16rem">{{ user.email }}</td>
          <td style="min-width: 16rem">
            @for(group of user.groups; track group) {
            <p-chip
              [label]="group.name"
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
              (click)="editUser(user)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
              (click)="deleteUser(user)"
            />
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class UsersListComponent implements OnInit {
  users: Signal<User[]> = signal<User[]>([]);
  selectedUsers?: User[];
  submitted = false;

  @ViewChild('dt') dt!: Table;

  private _usersService: UsersService = inject(UsersService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private _dialogService = inject(DialogService);

  private _userFormDialogRef: DynamicDialogRef | null = null;
  private _userFormCloseSub: Subscription | null = null;

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    await this._usersService.getUsers().then((data) => {
      this.users = data;
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    if (this._userFormDialogRef) {
      return;
    }

    this._userFormDialogRef = this._dialogService.open(UserFormComponent, {
      header: 'Create User',
      style: { 'max-height': '90vh', height: 'auto', width: 'fit-content' },
    });

    if (this._userFormCloseSub) {
      this._userFormCloseSub.unsubscribe();
    }
    this._userFormCloseSub = this._userFormDialogRef.onClose.subscribe(
      async (user: User | null) => {
        console.log('User form closed with data:', user);
      }
    );
  }

  editUser(user: User) {
    if (this._userFormDialogRef) {
      return;
    }

    this._userFormDialogRef = this._dialogService.open(UserFormComponent, {
      header: 'Update User',
      style: { 'max-height': '90vh', height: 'auto' },
      inputValues: {
        user,
      },
    });

    if (this._userFormCloseSub) {
      this._userFormCloseSub.unsubscribe();
    }
    this._userFormCloseSub = this._userFormDialogRef.onClose.subscribe(
      async (user: User | null) => {
        console.log('User form closed with data:', user);
      }
    );
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete user ' + user.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this._usersService.deleteUser(user);
        await this.loadData();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Deleted',
          life: 3000,
        });
      },
    });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.users().length; i++) {
      if (this.users()[i]._id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'info';
    }
  }

  // saveUser() {
  //   this.submitted = true;
  //   if (!this.user) {
  //     return;
  //   }

  //   if (this.users().find((u) => u._id === this.user?._id)) {
  //     // Update
  //     this.messageService.add({
  //       severity: 'success',
  //       summary: 'Successful',
  //       detail: `User ${this.user.name} Updated`,
  //       life: 3000,
  //     });
  //   } else {
  //     // Create
  //     this.messageService.add({
  //       severity: 'success',
  //       summary: 'Successful',
  //       detail: `User ${this.user.name} Created`,
  //       life: 3000,
  //     });
  //   }
  //   this.userDialog = false;
  //   this.user = undefined;
  // }
}
