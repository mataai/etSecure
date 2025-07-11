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

@Component({
  selector: 'app-room-form',
  imports: [ReactiveFormsModule, FloatLabelModule, ButtonModule, InputText],
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
        @if(this.formGroup.controls.name.touched) { @if
        (this.formGroup.controls.name.errors?.['required']){
        <small class="text-red-500"> Name is required. </small>
        }}
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
        @if (this.formGroup.controls.location.touched) { @if
        (this.formGroup.controls.location.errors?.['required']) {
        <small class="text-red-500">Location is required.</small>
        } }
      </div>
    </div>
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
    inject(DynamicDialogConfig)?.data?.room || null
  );
  private dialogRef = inject(DynamicDialogRef);
  private _roomService = inject(RoomsService);
  private _messageService = inject(MessageService);

  public formGroup = new FormGroup({
    name: new FormControl(this.room()?.name || '', Validators.required),
    location: new FormControl(this.room()?.location || '', [
      Validators.required,
    ]),
  });

  public submit() {
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
    resp
      .then((res) => {
        console.log('Room saved successfully:', res);
        this._messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved room successfully',
          life: 3000,
        });
        this.close(room);
      })
      .catch((err) => {
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

  public close(data: RoomUpsertRequest | null = null) {
    this.dialogRef.close(data);
  }
}
