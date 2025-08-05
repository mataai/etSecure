import { Component, inject, OnInit } from '@angular/core';
import { ServiceAccountsListComponent } from '../../../shared/components/service-accounts/service-accounts-list.component';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';
import { ServiceAccountFormComponent } from '../../../shared/components/service-accounts/service-account-form.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ServiceAccountsService } from '../../../shared/services/service-accounts.service';
import { Router } from '@angular/router';
import { ServiceAccount } from '@etsecure/data-contracts';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RoomsService } from '../../../shared/services/rooms.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-admin-service-accounts-page',
  standalone: true,
  imports: [
    ServiceAccountsListComponent,
    ToolbarModule,
    ButtonModule,
    DynamicDialogModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  template: `
    <div class="container mx-auto p-4">
      <h1
        class="text-3xl font-extrabold tracking-tight text-primary mb-8 text-center"
      >
        Service Accounts
      </h1>
      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button
            label="New"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            (onClick)="openCreateDialog()"
          />
        </ng-template>
      </p-toolbar>
      <p-card>
        <app-service-accounts-list
          [serviceAccounts]="this.serviceAccounts()"
          (viewServiceAccount)="this.openDetails($event)"
          (editServiceAccount)="this.openEditDialog($event)"
          (deleteServiceAccount)="this.openDeleteDialog($event)"
        />
      </p-card>
    </div>
    <p-toast />
    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ServiceAccountsListPage implements OnInit {
  private _serviceAccountsService = inject(ServiceAccountsService);
  public serviceAccounts = this._serviceAccountsService.data;
  private _roomService = inject(RoomsService);
  private _messageService: MessageService = inject(MessageService);
  private _router: Router = inject(Router);
  private _confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private _dialogService = inject(DialogService);
  private _serviceAccountFormDialogRef: DynamicDialogRef | null = null;
  private _serviceAccountFormCloseSub: Subscription | null = null;

  public ngOnInit() {
    this.loadData();
  }

  public openCreateDialog() {
    if (this._serviceAccountFormDialogRef) {
      return;
    }

    this._serviceAccountFormDialogRef = this._dialogService.open(
      ServiceAccountFormComponent,
      {
        header: 'Create ServiceAccount',
        style: { 'max-height': '90vh', height: 'auto', width: 'fit-content' },
        dismissableMask: true,
        modal: true,
        closable: true,
        closeOnEscape: false,
      },
    );

    this._serviceAccountFormCloseSub =
      this._serviceAccountFormDialogRef.onClose.subscribe(
        async (serviceAccount) => {
          console.log('ServiceAccount form closed with data:', serviceAccount);
          this._serviceAccountFormCloseSub?.unsubscribe();
          this._serviceAccountFormDialogRef = null;
          this._serviceAccountFormCloseSub = null;
        },
      );
  }

  public openEditDialog(serviceAccount: ServiceAccount) {
    if (this._serviceAccountFormDialogRef) {
      return;
    }
    console.log('Editing service account:', serviceAccount);
    this._serviceAccountFormDialogRef = this._dialogService.open(
      ServiceAccountFormComponent,
      {
        header: 'Update Service Account',
        style: { 'max-height': '90vh', height: 'auto' },
        dismissableMask: true,
        modal: true,
        closable: true,
        closeOnEscape: false,
        data: {
          serviceAccount,
        },
      },
    );

    this._serviceAccountFormCloseSub =
      this._serviceAccountFormDialogRef.onClose.subscribe(
        async (serviceaccount: ServiceAccount | null) => {
          console.log('ServiceAccount form closed with data:', serviceaccount);
          this._serviceAccountFormCloseSub?.unsubscribe();
          this._serviceAccountFormDialogRef = null;
          this._serviceAccountFormCloseSub = null;
        },
      );
  }

  public openDeleteDialog(serviceAccount: ServiceAccount) {
    console.log('Deleting serviceaccount:', serviceAccount);
    this._confirmationService.confirm({
      message:
        'Are you sure you want to delete Service Account: `' +
        serviceAccount.name +
        '` ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this._serviceAccountsService.deleteServiceAccount(
          serviceAccount._id,
        );
        await this.loadData();
        this._messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'ServiceAccount Deleted',
          life: 3000,
        });
      },
    });
  }

  public openDetails(serviceAccount: ServiceAccount) {
    this._router.navigate(['admin', 'service-accounts', serviceAccount._id]);
  }

  private async loadData() {
    this._serviceAccountsService.getServiceAccounts();
    this._roomService.getRooms();
  }
}
