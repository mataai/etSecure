import { Component, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '@etsecure/data-contracts';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, MultiSelectModule],
  template: ` <form class="flex flex-col gap-6">
    <span class="p-float-label">
      <label for="name">Name</label>
      <input type="text" pInputText id="name" required />
      @if(this.formGroup.touched) { @if
      (this.formGroup.controls.name.errors?.['required']){
      <small class="text-red-500"> Name is required. </small>
      }}
    </span>
    <div>
      <label for="email">Email</label>
      <input
        type="email"
        pInputText
        id="email"
        required
        [formControl]="formGroup.controls.email"
      />
      @if (this.formGroup.touched) { @if
      (this.formGroup.controls.email.errors?.['required']) {
      <small class="text-red-500">Email is required.</small>
      } @if (this.formGroup.controls.email.errors?.['email']) {
      <small class="text-red-500">Invalid email address.</small>
      } }
    </div>

    <div>
      <label for="groups" class="block font-bold mb-3"> Groups </label>
      <p-multiSelect
        id="groups"
        [options]="groups"
        optionLabel="name"
        placeholder="Select groups"
        [overlayOptions]="{ mode: 'modal' }"
        [formControl]="formGroup.controls.groups"
      />
    </div>
  </form>`,
  styles: [``],
})
export class UserFormComponent {
  public user = input<User | null>(null);

  // TODO : Fetch groups from the backend
  public groups = [{ name: 'Admin', value: 'etsecure_admin' }];

  public formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    groups: new FormControl<string[]>([], [Validators.required]),
  });

  constructor() {
    if (this.user()) {
      this.formGroup.patchValue({
        name: this.user()?.name || '',
        email: this.user()?.email || '',
      });
    }
  }
}
