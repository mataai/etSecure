import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
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

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="exportCSV()"
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
      <ng-template #header>
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
      </ng-template>
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
      [style]="{ width: '450px' }"
      header="User Details"
      [modal]="true"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          <div>
            @if(user?.name){
            <label for="name" class="block font-bold mb-3">Name</label>
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="user!.name"
              required
              fluid
            />
            <small class="text-red-500" *ngIf="submitted && !user?.name">
              Name is required.
            </small>
            }
          </div>
          <div>
            <!-- <label for="description" class="block font-bold mb-3"
              >Description</label
            >
            <textarea
              id="description"
              pTextarea
              [(ngModel)]="user.description"
              required
              rows="3"
              cols="20"
              fluid
            ></textarea> -->
          </div>

          <div>
            <label for="inventoryStatus" class="block font-bold mb-3"
              >Inventory Status</label
            >
            <!-- <p-select
              [(ngModel)]="user.inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="label"
              placeholder="Select a Status"
              fluid
            /> -->
          </div>

          <div>
            <!-- <span class="block font-bold mb-4">Category</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="user.category"
                />
                <label for="category1">Accessories</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="user.category"
                />
                <label for="category2">Clothing</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="user.category"
                />
                <label for="category3">Electronics</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="user.category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div> -->
          </div>

          <div class="grid grid-cols-12 gap-4">
            <!-- <div class="col-span-6">
              <label for="price" class="block font-bold mb-3">Price</label>
              <p-inputnumber
                id="price"
                [(ngModel)]="user.price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div> -->
          </div>
        </div>
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
  users = signal<User[]>([]);
  user?: User;
  selectedUsers?: User[];
  submitted = false;
  statuses: any[] = [
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' },
  ];

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols!: Column[];

  private _usersService: UsersService = inject(UsersService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDemoData();
  }

  loadDemoData() {
    this._usersService.getUsers().then((data) => {
      this.users.set(data);
    });

    this.statuses = this.cols = [
      { field: 'id', header: 'User Id' },
      { field: 'name', header: 'Name' },
      { field: 'category', header: 'Category' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
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
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected users?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.users.set(
          this.users().filter((val) => !this.selectedUsers?.includes(val))
        );
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
      message: 'Are you sure you want to delete ' + user.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.users.set(this.users().filter((val) => val.sub !== user.sub));
        this.user = undefined;
        // TODO delete user from the backend
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
      if (this.users()[i].sub === id) {
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
    const _users = this.users();
    if (!this.user) {
      return;
    }

    if (this.user.name?.trim()) {
      if (this.user.sub) {
        _users[this.findIndexById(this.user.sub)] = this.user;
        this.users.set([..._users]);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Updated',
          life: 3000,
        });
      } else {
        this.user.sub = this.createId();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Created',
          life: 3000,
        });
        this.users.set([..._users, this.user]);
      }

      this.userDialog = false;
      this.user = undefined;
    }
  }
}
