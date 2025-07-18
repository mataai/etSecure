import { Component, inject, input, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Room,
  RoomServiceAccount,
  ServiceAccount,
  ServiceAccountTypeLabels,
  ServiceAccountTypes,
  ServiceAccountUpsertRequest,
} from '@etsecure/data-contracts';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RoomsService } from '../../services/rooms.service';
import { ServiceAccountsService } from '../../services/service-accounts.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-service-account-form',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    SelectButtonModule,
    SelectModule,
    InputTextModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  template: `
    <form
      class="flex flex-col gap-4 mt-3"
      [formGroup]="this.formGroup"
      (ngSubmit)="this.onSubmit()"
    >
      <div class="flex flex-row gap-4 my-2">
        <div>
          <p-floatlabel>
            <label for="name">Name</label>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              [invalid]="
                formGroup.controls.name.invalid &&
                formGroup.controls.name.touched
              "
              required
            />
          </p-floatlabel>
          @if(this.formGroup.controls.name.touched) { @if
          (this.formGroup.controls.name.errors?.['required']){
          <small class="text-red-500"> Name is required. </small>
          }}
        </div>
        <div class="flex-1">
          <p-floatlabel>
            <label for="type" class="block mb-1">Type</label>
            <p-selectbutton
              [options]="typeOptions"
              optionLabel="label"
              optionValue="value"
              aria-labelledby="basic"
              formControlName="type"
              [invalid]="
                formGroup.controls.type.invalid &&
                formGroup.controls.type.touched
              "
            />
          </p-floatlabel>
          @if(this.formGroup.controls.type.touched) { @if
          (this.formGroup.controls.type.errors?.['required']){
          <small class="text-red-500"> Type is required. </small>
          }}
        </div>
      </div>
      @if (this.formGroup.controls.type.value === 'pi') {
      <div class="flex flex-row gap-4 my-2">
        <div class="flex-1">
          <p-floatlabel>
            <label for="roomId" class="block mb-1">Room</label>
            <p-select
              [options]="roomOptions()"
              optionLabel="name"
              placeholder="Select a Room"
              class="w-full md:w-56"
              formControlName="room"
              [invalid]="
                formGroup.controls.room.invalid &&
                formGroup.controls.room.touched
              "
              [overlayOptions]="{ mode: 'modal' }"
            />
          </p-floatlabel>
          @if(this.formGroup.controls.room.touched) { @if
          (this.formGroup.controls.room.errors?.['required']){
          <small class="text-red-500"> Room is required. </small>
          }}
        </div>
      </div>
      }
      <div class="flex justify-end">
        <p-button
          label="Submit"
          type="submit"
          [disabled]="formGroup.untouched || formGroup.invalid"
        />
        <p-button
          label="Cancel"
          class="ml-2"
          [outlined]="true"
          (click)="this.close()"
        />
      </div>
    </form>
  `,
})
export class ServiceAccountFormComponent implements OnInit {
  public serviceAccount = input<ServiceAccount | null>(
    inject(DynamicDialogConfig)?.data?.serviceAccount || null
  );
  private dialogRef = inject(DynamicDialogRef);
  private _roomService = inject(RoomsService);
  private _serviceAccountsService = inject(ServiceAccountsService);
  private _messageService = inject(MessageService);
  public roomOptions = this._roomService.data;
  public typeOptions = Object.values(ServiceAccountTypes).map((type) => ({
    label: ServiceAccountTypeLabels[type],
    value: type,
  }));

  public formGroup = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    type: new FormControl<ServiceAccountTypes | null>(ServiceAccountTypes.AI, [
      Validators.required,
    ]),
    room: new FormControl<Room | null>(null),
  });

  public get isEdit() {
    return !!this.serviceAccount()?._id;
  }

  private _typeSubscription!: Subscription;

  ngOnInit(): void {
    if (!this._typeSubscription) {
      this._typeSubscription =
        this.formGroup.controls.type.valueChanges.subscribe((type) => {
          if (type === ServiceAccountTypes.PI) {
            this.formGroup.controls.room.setValidators(Validators.required);
          } else {
            this.formGroup.controls.room.removeValidators([
              Validators.required,
            ]);
            this.formGroup.controls.room.setValue(null);
          }
          this.formGroup.controls.room.updateValueAndValidity();
        });
    }

    this._initFormValues();
  }

  public cancel() {
    this.dialogRef.close();
  }

  public async onSubmit() {
    this.formGroup.markAllAsTouched();
    console.log('Form submitted:', this.formGroup.value);
    if (this.formGroup.invalid) {
      this._messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
      });
      return;
    }
    console.log('Submitting service account:', this.formGroup.value);
    const serviceAccountData = {
      name: this.formGroup.value.name,
      type: this.formGroup.value.type,
      roomId: (this.formGroup.value.room as Room)?._id,
    } as ServiceAccountUpsertRequest;

    const id = this.serviceAccount()?._id;

    if (id) {
      this._serviceAccountsService
        .updateServiceAccount(id, serviceAccountData)
        .then((serviceAccount) => {
          this._messageService.add({
            severity: 'success',
            summary: 'Update Successful',
            detail: 'Service account updated successfully.',
          });
          this.close(serviceAccount);
        })
        .catch(() => {
          this._messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Failed to update service account. Please try again.',
          });
        });
    } else {
      this._serviceAccountsService
        .createServiceAccount(serviceAccountData)
        .then((serviceAccount) => {
          this._messageService.add({
            severity: 'success',
            summary: 'Creation Successful',
            detail: 'Service account created successfully.',
          });
          this.close(serviceAccount);
        })
        .catch(() => {
          this._messageService.add({
            severity: 'error',
            summary: 'Creation Failed',
            detail: 'Failed to create service account. Please try again.',
          });
        });
    }
  }

  public close(data?: ServiceAccount | null) {
    this.dialogRef.close(data);
  }

  private async _initFormValues() {
    const serviceAccount = this.serviceAccount();
    if (!serviceAccount) {
      return;
    }

    this.formGroup.controls.type.setValue(serviceAccount.type);
    this.formGroup.controls.name.setValue(serviceAccount.name || '');
    if (serviceAccount.type === ServiceAccountTypes.PI) {
      const room = this.roomOptions().find(
        (room) => room._id === (serviceAccount as RoomServiceAccount).room._id
      );
      this.formGroup.controls.room.setValue(room || null);
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 90);
    }
  }
}
