import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '@etsecure/data-contracts';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { UsersService } from '../../services/users.service';
import { MessageService } from 'primeng/api';
interface GroupOption {
  name: string;
  value: string;
}
@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MultiSelectModule,
    FloatLabelModule,
    ButtonModule,
    InputText,
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
            formControlName="name"
            required
          />
        </p-floatlabel>
        @if(this.formGroup.touched) { @if
        (this.formGroup.controls.name.errors?.['required']){
        <small class="text-red-500"> Name is required. </small>
        }}
      </div>
      <div>
        <p-floatlabel>
          <label for="email">Email</label>
          <input
            type="email"
            pInputText
            id="email"
            required
            [formControl]="formGroup.controls.email"
          />
        </p-floatlabel>
        @if (this.formGroup.touched) { @if
        (this.formGroup.controls.email.errors?.['required']) {
        <small class="text-red-500">Email is required.</small>
        } @if (this.formGroup.controls.email.errors?.['email']) {
        <small class="text-red-500">Invalid email address.</small>
        } }
      </div>
    </div>
    <div class="flex flex-row gap-4 my-2">
      <div>
        <p-floatlabel>
          <label for="groups" class="block font-bold mb-3"> Groups </label>
          <p-multiSelect
            id="groups"
            [options]="groups"
            optionLabel="name"
            placeholder="Select groups"
            [overlayOptions]="{ mode: 'modal' }"
            [formControl]="this.formGroup.controls.groups"
          />
        </p-floatlabel>
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
export class UserFormComponent {
  public user = input<User | null>(null);
  private dialogRef = inject(DynamicDialogRef);
  private _userService = inject(UsersService);
  private _messageService = inject(MessageService);
  // TODO : Fetch groups from the backend
  public groups: GroupOption[] = [{ name: 'Admin', value: 'etsecure-admin' }];

  public formGroup = new FormGroup({
    name: new FormControl(this.user()?.name || '', Validators.required),
    username: new FormControl(this.user()?.username || '', Validators.required),
    email: new FormControl(this.user()?.email || '', [
      Validators.required,
      Validators.email,
    ]),
    groups: new FormControl<GroupOption[]>(
      this.user()
        ?.groups.map((uGroup: string) =>
          this.groups.find((oGroup) => oGroup.value === uGroup)
        )
        .filter((grp) => !!grp) || []
    ),
  });

  constructor() {
    this.formGroup.controls.email.valueChanges.subscribe(() => {
      this.formGroup.controls.username.setValue(
        this.formGroup.value.email?.split('@')[0] || ''
      );
    });
  }

  public submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const user: CreateUserRequest | UpdateUserRequest = {
      id: this.user()?.authentik_id,
      name: this.formGroup.value.name!,
      email: this.formGroup.value.email!,
      username: this.formGroup.value.email?.split('@')[0] || '',
      groups: this.formGroup.value.groups?.map((x) => x.value) || [],
    };
    const resp = !this.user()?.authentik_id
      ? this._userService.createUser(user as CreateUserRequest)
      : this._userService.updateUser(user as UpdateUserRequest);
    resp
      .then((res) => {
        console.log('User saved successfully:', res);
        this._messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved user successfully',
          life: 3000,
        });
        this.close(user);
      })
      .catch((err) => {
        console.error('Error saving user:', err);
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
            summary: 'Failed saving user. Please try again.',
            detail: 'If the problem persists, contact support.',
            life: 3000,
          });
        }
      });
  }

  public close(data: CreateUserRequest | UpdateUserRequest | null = null) {
    this.dialogRef.close(data);
  }
}
