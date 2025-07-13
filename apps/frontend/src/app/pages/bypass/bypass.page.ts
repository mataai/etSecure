import { Component, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../../shared/services/rooms.service';
import { SelectModule } from 'primeng/select';
import { Room } from '@etsecure/data-contracts';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-bypass',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ToastModule],
  providers: [MessageService],
  template: `
    <div
      class="flex flex-col items-center justify-center min-h-[60vh] py-8 mt-24"
    >
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">
          Backup Unlock Request</span
        >
      </div>
      <form
        (ngSubmit)="submitBypass()"
        class="flex flex-col items-center gap-8 w-full max-w-md p-6 bg-surface-900 rounded-lg shadow"
      >
        <div class="mb-4">
          <label
            for="roomId"
            class="block text-sm font-medium text-surface-500 mb-1"
          >
            Room ID
          </label>
          <p-select
            [options]="roomOptions()"
            [(ngModel)]="selectedRoom"
            [ngModelOptions]="{ standalone: true }"
            optionLabel="name"
            placeholder="Select a City"
            class="w-full md:w-56"
          />
        </div>
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-white rounded w-full"
          [disabled]="status === 'processing'"
        >
          Send Unlock Request
        </button>
        @if (status !== 'idle') {
        <div class="text-center mt-2 min-h-[1.5rem]">
          @switch (status) {
            @case ('processing') {
            <span class="text-surface-500"> Processing... </span>
            } @case ('success') {
            <span class="text-green-500"> Unlock request sent! </span>
            }
            @case ('error') {
              @if( errorMessage) {
              <span class="text-red-500">{{ errorMessage }}</span>
              } @else {
              <span class="text-red-500"> Failed to send request. </span>
              }
            }
          }
        </div>
        }
      </form>
    </div>
    <p-toast />
  `,
})
export class BypassPage {
  public selectedRoom: Room | null = null;
  public status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
  public roomOptions = model<Room[]>([]);
  public errorMessage: string | null = null;

  private _messageService = inject(MessageService);

  private _roomsService = inject(RoomsService);

  /**
   *
   */
  constructor() {
    this._roomsService.getRooms().then((rooms) => {
      this.roomOptions.set(rooms());
    });
  }

  async submitBypass() {
    if (!this.selectedRoom) return;
    this.status = 'processing';
    try {
      await this._roomsService.requestBypass(this.selectedRoom._id!);
      this.status = 'success';
      setTimeout(() => (this.status = 'idle'), 2000);
    } catch (err: any) {
      this.status = 'error';
      if (
        err['error'] &&
        err['error']['error'] &&
        err['error']['error'] == 'No bypasses left, Contact Admin'
      ) {
        this.errorMessage = err['error']['error'];
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err['error']['error'],
        });
      } else {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error bypassing unlock, Contact Admin',
        });
      }
      setTimeout(() => (this.status = 'idle'), 2000);
    }
  }
}
