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
  template: ` <div class="flex flex-col gap-6">
    <span class="p-float-label">
      <label for="name" class="block font-bold mb-3">Name</label>
      <input type="text" pInputText id="name" required />
      @if(this.formGroup.touched) { @if
      (this.formGroup.controls.name.errors?.['required']){
      <small class="text-red-500"> Name is required. </small>
      }}
    </span>
    <div>
      <label for="email" class="block font-bold mb-3">Email</label>
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
        [options]="['Admin', 'User', 'Guest']"
        optionLabel="name"
        placeholder="Select groups"
        [formControl]="formGroup.controls.groups"
      />
    </div>

    <div>
      <!-- <span class="block font-bold mb-4">Category</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="user.category"
                />
                <label for="category1">Accessories</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="user.category"
                />
                <label for="category2">Clothing</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="user.category"
                />
                <label for="category3">Electronics</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="user.category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div> -->
    </div>

    <div class="grid grid-cols-12 gap-4">
      <!-- <div class="col-span-6">
              <label for="price" class="block font-bold mb-3">Price</label>
              <p-inputnumber
                id="price"
                [(ngModel)]="user.price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div> -->
    </div>
  </div>`,
  styles: [``],
})
export class UserFormComponent {
  public user = input<User | null>(null);

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
