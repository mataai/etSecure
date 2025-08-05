import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RoomUpsertRequest, Room } from '@etsecure/data-contracts';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { RoomsService } from '../../services/rooms.service';
import { ListboxModule } from 'primeng/listbox';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-room-form',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    InputText,
    ListboxModule,
  ],
  template: ` <form class="flex flex-col gap-4 mt-3" [formGroup]="formGroup">
    <div class="flex flex-row gap-4 my-2">
      <div>
        <p-floatlabel>
          <label for="name">Name</label>
          <input
            type="text"
            pInputText
            id="name"
            [formControl]="this.formGroup.controls.name"
            required
          />
        </p-floatlabel>
        @if (this.formGroup.controls.name.touched) {
          @if (this.formGroup.controls.name.errors?.['required']) {
            <small class="text-red-500"> Name is required. </small>
          }
        }
      </div>
      <div>
        <p-floatlabel>
          <label for="location">Location</label>
          <input
            type="location"
            pInputText
            id="location"
            required
            [formControl]="formGroup.controls.location"
          />
        </p-floatlabel>
        @if (this.formGroup.controls.location.touched) {
          @if (this.formGroup.controls.location.errors?.['required']) {
            <small class="text-red-500">Location is required.</small>
          }
        }
      </div>
    </div>
    @if (this.membersFormControl) {
      <div class="flex flex-row gap-4 my-2">
        <label for="location">Members</label>
        <p-listbox
          [options]="userOptions"
          optionLabel="name"
          [multiple]="true"
          [metaKeySelection]="false"
          [formControl]="this.membersFormControl"
          class="w-full md:w-56"
        />
      </div>
    }

    <div class="flex justify-end">
      <p-button
        label="Submit"
        [disabled]="formGroup.invalid"
        (click)="this.submit()"
      />
      <p-button
        label="Cancel"
        class="ml-2"
        [outlined]="true"
        (click)="this.close()"
      />
    </div>
  </form>`,
})
export class RoomFormComponent {
  public room = input<Room | null>(
    inject(DynamicDialogConfig)?.data?.room || null,
  );
  private dialogRef = inject(DynamicDialogRef);
  private _roomService = inject(RoomsService);
  private _usersService = inject(UsersService);
  private _messageService = inject(MessageService);

  public formGroup = new FormGroup({
    name: new FormControl(this.room()?.name || '', Validators.required),
    location: new FormControl(this.room()?.location || '', [
      Validators.required,
    ]),
  });
  public membersFormControl?: FormControl<typeof this.userOptions | null>;
  public userOptions: { name: string; value: string }[] = [];

  public get isEdit() {
    return !!this.room()?._id;
  }

  constructor() {
    console.log(this.isEdit, this.userOptions);
    if (this.isEdit && this.userOptions.length <= 0) {
      this.initMembersSelection();
    }
  }

  public async submit() {
    let upsertSuccess;
    let membersSuccess;
    if (
      (this.room() &&
        this.room()?._id &&
        (this.room()?.name !== this.formGroup.value.name ||
          this.room()?.location !== this.formGroup.value.location)) ||
      !this.room()
    ) {
      if (this.formGroup.invalid) {
        this.formGroup.markAllAsTouched();
        return;
      }
      const room: RoomUpsertRequest = {
        name: this.formGroup.value.name!,
        location: this.formGroup.value.location!,
      };
      const id = this.room()?._id;
      const resp = !id
        ? this._roomService.createRoom(room)
        : this._roomService.updateRoom(id, room);
      await resp
        .then(() => {
          upsertSuccess = true;
        })
        .catch((err) => {
          upsertSuccess = false;
          console.error('Error saving room:', err);
          if (err.status >= 400 && err.status < 500) {
            this._messageService.add({
              severity: 'error',
              summary: 'Invalid input',
              detail: 'Please check the input and try again.',
              life: 3000,
            });
          } else {
            this._messageService.add({
              severity: 'error',
              summary: 'Failed saving room. Please try again.',
              detail: 'If the problem persists, contact support.',
              life: 3000,
            });
          }
        });
    }

    if (
      this.membersFormControl &&
      this.membersFormControl.value &&
      this.room()?._id
    ) {
      const selectedUserIds = this.membersFormControl.value.map((u) => u.value);
      const originalUserIds = this.room()?.users?.map((u) => u._id);
      const isSame =
        !!originalUserIds &&
        selectedUserIds.length === originalUserIds.length &&
        selectedUserIds.every((id: string) => originalUserIds.includes(id));
      if (!isSame) {
        await this._roomService
          .setAllowedUsersInRoom(this.room()!._id!, {
            userIds: selectedUserIds,
          })
          .then(() => {
            membersSuccess = true;
          })
          .catch((err) => {
            membersSuccess = false;
            console.error('Error updating room members:', err);
            this._messageService.add({
              severity: 'error',
              summary: 'Failed updating room members. Please try again.',
              detail: 'If the problem persists, contact support.',
              life: 3000,
            });
          });
      }
    }

    console.log(membersSuccess, upsertSuccess);
    if (membersSuccess != false && upsertSuccess != false) {
      await this._roomService.getRooms();
      this._messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Saved room successfully',
        life: 3000,
      });
      this.close();
    }
  }

  public close(data: RoomUpsertRequest | null = null) {
    this.dialogRef.close(data);
  }

  private initMembersSelection() {
    this._usersService.getUsers().then((users) => {
      this.userOptions = users().map((user) => ({
        name: user.name,
        value: user._id!,
      }));
      const startingValue =
        this.room()
          ?.users?.map((user) =>
            this.userOptions.find((x) => x.value == user._id),
          )
          ?.filter((x) => !!x) || [];
      console.log(startingValue);
      this.membersFormControl = new FormControl(startingValue, [
        Validators.required,
      ]);
    });
  }
}
