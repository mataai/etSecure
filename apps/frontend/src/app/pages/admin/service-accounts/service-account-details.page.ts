import { Component, effect, inject, model } from '@angular/core';
import {
  Room,
  ServiceAccount,
  ServiceAccountTypes,
} from '@etsecure/data-contracts';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ServiceAccountsService } from '../../../shared/services/service-accounts.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Toast } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-service-account-details',
  imports: [CardModule, ButtonModule, ConfirmDialogModule, Toast, DialogModule],
  providers: [ConfirmationService, DialogService, MessageService],
  template: `
    <p-card>
      <div class="flex flex-col gap-4">
        <h1 class="text-xl font-semibold">Service Account Details</h1>
        @if(this.serviceAccount() ){
        <div class="flex flex-wrap gap-6">
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>ID:</strong> {{ this.serviceAccount()!._id }}
          </div>
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Name:</strong> {{ this.serviceAccount()!.name }}
          </div>
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Type:</strong> {{ this.serviceAccount()!.type }}
          </div>
          @if (this.getRoom) {
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Room:</strong>
            {{ this.getRoom.name }}
          </div>
          }

          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Tokens:</strong> {{ this.serviceAccount()!.tokens }}
          </div>
        </div>

        <div class="flex flex-wrap gap-6">
          <p-button label="Add Token" (click)="onAddToken()"></p-button>
        </div>
        }
      </div>
    </p-card>

    <p-toast />
    <p-confirmdialog [style]="{ width: '500px' }" />
    <p-dialog
      [modal]="true"
      [visible]="!!this.token()"
      (onHide)="this.token.set(null)"
    >
      <div class="flex flex-col gap-8">
        <p class="text-lg font-semibold text-center">
          Use this token to authenticate with the service account to access the
          API.
          <br />
          Make sure to store it securely, as it will not be shown again.
        </p>
        <p class="text-lg font-semibold text-center">Copy the token below:</p>

        <button
          type="button"
          class="text-xl font-bold bg-transparent border-none cursor-pointer select-text "
          (click)="copyToken()"
          (keyup.enter)="copyToken()"
          aria-label="Copy token"
        >
          {{ this.token() }}
        </button>
        <div class="flex justify-end gap-2">
          <p-button label="Ok" (click)="token.set(null)" />
        </div>
      </div>
    </p-dialog>
  `,
})
export class ServiceAccountDetailsPage {
  public serviceAccount = model<ServiceAccount | null>(null);
  public token = model<string | null>(null);

  private _activatedRoute = inject(ActivatedRoute);
  private _serviceAccountService = inject(ServiceAccountsService);
  private _confirmationService = inject(ConfirmationService);
  private _messageService = inject(MessageService);

  public get getRoom(): Room | null {
    const serviceAccount = this.serviceAccount();
    if (!serviceAccount) {
      return null;
    }
    if (serviceAccount.type !== ServiceAccountTypes.PI) {
      return null;
    }
    return serviceAccount.room;
  }

  constructor() {
    console.log('ServiceAccountDetailsPage constructor called');
    this._loadServiceAccount();
  }

  public onAddToken(): void {
    this._confirmationService.confirm({
      header: 'Add Token',
      message: 'Are you sure you want to add a token?',
      accept: async () => {
        this._serviceAccountService
          .requestServiceAccountToken(this.serviceAccount()!._id)
          .then((token) => {
            this.token.set(token);
            this._messageService.add({
              severity: 'success',
              summary: 'Token Generated Successfully',
            });
            this._loadServiceAccount();
          })
          .catch((error) => {
            this._messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to add token: ${error.message}`,
            });
          });
      },
    });
  }

  public copyToken() {
    if (!this.token()) {
      this._messageService.add({
        severity: 'warn',
        summary: 'No token available',
        detail: 'Please generate a token first.',
        life: 3000,
      });
      return;
    }

    navigator.clipboard
      .writeText(this.token()!)
      .then(() => {
        this._messageService.add({
          severity: 'success',
          summary: 'Token copied',
          detail: 'Token has been copied to clipboard.',
          life: 3000,
        });
      })
      .catch((err) => {
        console.error('Failed to copy token:', err);
        this._messageService.add({
          severity: 'error',
          summary: 'Copy failed',
          detail: 'Failed to copy token to clipboard.',
          life: 3000,
        });
      });
  }

  private async _loadServiceAccount() {
    this.serviceAccount.set(
      await this._serviceAccountService.getServiceAccount(
        this._activatedRoute.snapshot.params['id']
      )
    );
  }
}
