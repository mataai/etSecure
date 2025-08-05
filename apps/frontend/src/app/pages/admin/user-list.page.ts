import { Component, inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User } from '@etsecure/data-contracts';
import { UserFormComponent } from '../../shared/components/users/user-form.component';
import { UsersListComponent } from '../../shared/components/users/users-list.component';
import { UsersService } from '../../shared/services/users.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-users-list-page',
  imports: [
    UsersListComponent,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    ConfirmDialogModule,
    CardModule,
  ],
  providers: [UsersService, MessageService, ConfirmationService, DialogService],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="createUser()"
        />
      </ng-template>
    </p-toolbar>
    <p-card>
      <app-users-list
        [users]="this.users()"
        (viewUser)="this.openUserDetails($event)"
        (createUser)="this.createUser()"
        (editUser)="this.editUser($event)"
        (deleteUser)="this.deleteUser($event)"
      >
      </app-users-list>
    </p-card>
    <p-toast />
    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class UsersListPage implements OnInit {
  private _router = inject(Router);
  private _usersService = inject(UsersService);
  public users = this._usersService.users;
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private _dialogService = inject(DialogService);

  private _userFormDialogRef: DynamicDialogRef | null = null;
  private _userFormCloseSub: Subscription | null = null;

  public ngOnInit() {
    this.loadData();
  }

  public createUser() {
    if (this._userFormDialogRef) {
      return;
    }

    this._userFormDialogRef = this._dialogService.open(UserFormComponent, {
      header: 'Create User',
      style: { 'max-height': '90vh', height: 'auto', width: 'fit-content' },
      dismissableMask: true,
      modal: true,
      closable: true,
      closeOnEscape: false,
    });

    this._userFormCloseSub = this._userFormDialogRef.onClose.subscribe(
      async (user: User | null) => {
        console.log('User form closed with data:', user);
        this._userFormCloseSub?.unsubscribe();
        this._userFormDialogRef = null;
        this._userFormCloseSub = null;
      },
    );
  }

  public editUser(user: User) {
    if (this._userFormDialogRef) {
      return;
    }
    console.log('Editing user:', user);
    this._userFormDialogRef = this._dialogService.open(UserFormComponent, {
      header: 'Update User',
      style: { 'max-height': '90vh', height: 'auto' },
      dismissableMask: true,
      modal: true,
      closable: true,
      closeOnEscape: false,
      data: {
        user,
      },
    });

    this._userFormCloseSub = this._userFormDialogRef.onClose.subscribe(
      async (user: User | null) => {
        console.log('User form closed with data:', user);
        this._userFormCloseSub?.unsubscribe();
        this._userFormDialogRef = null;
        this._userFormCloseSub = null;
      },
    );
  }

  public deleteUser(user: User) {
    console.log('Deleting user:', user);
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

  public openUserDetails(user: User) {
    this._router.navigate(['admin', 'users', user._id]);
  }

  private async loadData() {
    this._usersService.getUsers();
  }
}
