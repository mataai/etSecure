import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '@etsecure/data-contracts';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
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
    <div class="my-2 md:w-1/3">
      <p-floatlabel>
        <label for="groups" class="block font-bold mb-3"> Groups </label>
        <p-multiSelect
          id="groups"
          [options]="groups"
          optionLabel="name"
          placeholder="Select groups"
          [overlayOptions]="{ mode: 'modal' }"
          [formControl]="formGroup.controls.groups"
        />
      </p-floatlabel>
    </div>
  </form>`,
  styles: [``],
})
export class UserFormComponent {
  public user = input<User | null>(null);
  private dialogRef = inject(DynamicDialogRef);
  // TODO : Fetch groups from the backend
  public groups: GroupOption[] = [{ name: 'Admin', value: 'etsecure-admin' }];

  public formGroup = new FormGroup({
    name: new FormControl(this.user()?.name || '', Validators.required),
    email: new FormControl(this.user()?.email || '', [
      Validators.required,
      Validators.email,
    ]),
    groups: new FormControl<GroupOption[]>(
      this.user()
        ?.groups.map((uGroup: string) =>
          this.groups.find((oGroup) => oGroup.value === uGroup)
        )
        .filter((grp) => !!grp) || [],
      [Validators.required]
    ),
  });

  constructor() {
    this.formGroup.valueChanges.subscribe(() => {
      console.log(this.user());
      console.log('Form changes:', this.formGroup.value);
    });
  }

  public submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const user: User = {
      authentik_id: this.user()?.authentik_id || '',
      name: this.formGroup.value.name || '',
      email: this.formGroup.value.email || '',
      groups: this.formGroup.value.groups?.map((x) => x.value) || [],
    };
    this.dialogRef.close(user);
  }
}
