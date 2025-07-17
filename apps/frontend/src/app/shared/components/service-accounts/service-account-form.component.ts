import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ServiceAccountUpsertRequest } from '@etsecure/data-contracts';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-service-account-form',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
  ],
  template: `
    <form class="flex flex-col gap-4 mt-3">
      <div class="flex flex-row gap-4 my-2">
        <div class="flex-1">
          <label for="name" class="block mb-1">Name</label>
          <input type="text" id="name" class="p-inputtext w-full" placeholder="Service Account Name" />
        </div>
        <div class="flex-1">
          <label for="type" class="block mb-1">Type</label>
          <select id="type" class="p-inputtext w-full">
            <option value="">Select type</option>
            <option value="pi">PI</option>
            <option value="ai">AI</option>
          </select>
        </div>
      </div>
      <div class="flex flex-row gap-4 my-2">
        <div class="flex-1">
          <label for="roomId" class="block mb-1">Room</label>
          <select id="roomId" class="p-inputtext w-full">
            <option value="">Select room</option>
            <option value="room1">Room 1</option>
            <option value="room2">Room 2</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end">
        <button type="button" class="p-button p-component">Submit</button>
        <button type="button" class="p-button p-component ml-2 p-button-outlined">Cancel</button>
      </div>
    </form>
  `,
})
export class ServiceAccountFormComponent {}
