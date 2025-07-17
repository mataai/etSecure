import { Component, inject } from '@angular/core';
import { ServiceAccountsListComponent } from '../../../shared/components/service-accounts/service-accounts-list.component';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ServiceAccountFormComponent } from '../../../shared/components/service-accounts/service-account-form.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-service-accounts-page',
  standalone: true,
imports: [ServiceAccountsListComponent, ToolbarModule, ButtonModule, DynamicDialogModule],
  providers: [DialogService],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-extrabold tracking-tight text-primary mb-8 text-center">
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
      <app-service-accounts-list />
    </div>
  `,
})
export class AdminServiceAccountsPage {
  private dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef | null = null;

  openCreateDialog() {
    this.dialogRef = this.dialogService.open(ServiceAccountFormComponent, {
      header: 'New Service Account',
      width: '500px',
      styleClass: 'p-dialog-custom',
      closable: true,
      dismissableMask: true,
      modal: true,
      data: {},
      contentStyle: { 'padding-bottom': '2rem' },
    });
  }
}
