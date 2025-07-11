import { Component, inject, OnInit, Signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsersService } from '../../services/users.service';
import { User } from '@etsecure/data-contracts';
import { UserFormComponent } from './user-create.component';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    UserFormComponent,
  ],
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
        <p-button
          severity="secondary"
          label="Delete"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedUsers()"
          [disabled]="!selectedUsers || !selectedUsers.length"
        />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="users()"
      [rows]="10"
      [columns]="cols"
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
      <!-- <ng-template #header>
        <tr>
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>
          <th style="min-width: 16rem">Code</th>
          <th pSortableColumn="name" style="min-width:16rem">
            Name
            <p-sortIcon field="name" />
          </th>
          <th>Image</th>
          <th pSortableColumn="price" style="min-width: 8rem">
            Price
            <p-sortIcon field="price" />
          </th>
          <th pSortableColumn="category" style="min-width:10rem">
            Category
            <p-sortIcon field="category" />
          </th>
          <th pSortableColumn="rating" style="min-width: 12rem">
            Reviews
            <p-sortIcon field="rating" />
          </th>
          <th pSortableColumn="inventoryStatus" style="min-width: 12rem">
            Status
            <p-sortIcon field="inventoryStatus" />
          </th>
          <th style="min-width: 12rem"></th>
        </tr>
      </ng-template> -->
      <ng-template #body let-user>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="user" />
          </td>
          <td style="min-width: 12rem">{{ user.code }}</td>
          <td style="min-width: 16rem">{{ user.name }}</td>
          <td>
            <img
              [src]="
                'https://primefaces.org/cdn/primeng/images/demo/user/' +
                user.image
              "
              [alt]="user.name"
              style="width: 64px"
              class="rounded"
            />
          </td>
          <td>{{ user.price | currency : 'USD' }}</td>
          <td>{{ user.category }}</td>
          <td>
            <p-rating [(ngModel)]="user.rating" [readonly]="true" />
          </td>
          <td>
            <p-tag
              [value]="user.inventoryStatus"
              [severity]="getSeverity(user.inventoryStatus)"
            />
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

    <p-dialog
      [(visible)]="userDialog"
      [style]="{ width: '450px', height: 'auto', maxHeight: '90vh' }"
      header="User Details"
      [modal]="true"
    >
      <ng-template #content>
        <app-user-form></app-user-form>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
        />
        <p-button label="Save" icon="pi pi-check" (click)="saveUser()" />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
  providers: [MessageService, UsersService, ConfirmationService],
})
export class UsersListComponent implements OnInit {
  userDialog = false;
  users!: Signal<User[]>;
  user?: User;
  selectedUsers?: User[];
  submitted = false;

  @ViewChild('dt') dt!: Table;

  cols: Column[] = [
    { field: 'sub', header: 'Id' },
    { field: 'name', header: 'Name' },
    { field: 'image', header: 'Image' },
    { field: 'price', header: 'Price' },
    { field: 'category', header: 'Category' },
    { field: 'rating', header: 'Reviews' },
    { field: 'inventoryStatus', header: 'Status' },
  ];

  private _usersService: UsersService = inject(UsersService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);

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
    this.user = undefined;
    this.submitted = false;
    this.userDialog = true;
  }

  editUser(user: User) {
    this.user = { ...user };
    this.userDialog = true;
  }

  deleteSelectedUsers() {
    if (!!this.selectedUsers && this.selectedUsers.length >= 0)
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete the selected users?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (!this.selectedUsers) {
            return;
          }
          this._usersService.deleteUsers(this.selectedUsers);
          this.selectedUsers = undefined;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Users Deleted',
            life: 3000,
          });
        },
      });
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete user ' + user.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        // TODO delete user from the backend
        this._usersService.deleteUser(user);

        await this.loadData();
        this.user = undefined;
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

  saveUser() {
    this.submitted = true;
    if (!this.user) {
      return;
    }

    if (this.users().find((u) => u._id === this.user?._id)) {
      // Update
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: `User ${this.user.name} Updated`,
        life: 3000,
      });
    } else {
      // Create
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: `User ${this.user.name} Created`,
        life: 3000,
      });
    }
    this.userDialog = false;
    this.user = undefined;
  }
}
