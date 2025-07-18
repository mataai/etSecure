import { Component, inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Room } from '@etsecure/data-contracts';
import { RoomFormComponent } from '../../shared/components/rooms/room-form.component';
import { RoomsListComponent } from '../../shared/components/rooms/rooms-list.component';
import { RoomsService } from '../../shared/services/rooms.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms-list-page',
  imports: [
    RoomsListComponent,
    ToolbarModule,
    ButtonModule,
    DynamicDialogModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [RoomsService, MessageService, ConfirmationService, DialogService],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="createRoom()"
        />
      </ng-template>
    </p-toolbar>
    <app-rooms-list
      [rooms]="this.rooms()"
      (viewRoom)="this.openRoomDetails($event)"
      (createRoom)="this.createRoom()"
      (editRoom)="this.editRoom($event)"
      (deleteRoom)="this.deleteRoom($event)"
    >
    </app-rooms-list>

    <p-toast />
    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class RoomsListPage implements OnInit {
  private _roomsService = inject(RoomsService);
  public rooms = this._roomsService.data;
  private messageService: MessageService = inject(MessageService);
  private _router: Router = inject(Router);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private _dialogService = inject(DialogService);

  private _roomFormDialogRef: DynamicDialogRef | null = null;
  private _roomFormCloseSub: Subscription | null = null;

  public ngOnInit() {
    this.loadData();
  }

  public createRoom() {
    if (this._roomFormDialogRef) {
      return;
    }

    this._roomFormDialogRef = this._dialogService.open(RoomFormComponent, {
      header: 'Create Room',
      style: { 'max-height': '90vh', height: 'auto', width: 'fit-content' },
      dismissableMask: true,
      modal: true,
      closable: true,
      closeOnEscape: false,
    });

    this._roomFormCloseSub = this._roomFormDialogRef.onClose.subscribe(
      async (room: Room | null) => {
        console.log('Room form closed with data:', room);
        this._roomFormCloseSub?.unsubscribe();
        this._roomFormDialogRef = null;
        this._roomFormCloseSub = null;
      }
    );
  }

  public editRoom(room: Room) {
    if (this._roomFormDialogRef) {
      return;
    }
    console.log('Editing room:', room);
    this._roomFormDialogRef = this._dialogService.open(RoomFormComponent, {
      header: 'Update Room',
      style: { 'max-height': '90vh', height: 'auto' },
      dismissableMask: true,
      modal: true,
      closable: true,
      closeOnEscape: false,
      data: {
        room,
      },
    });

    this._roomFormCloseSub = this._roomFormDialogRef.onClose.subscribe(
      async (room: Room | null) => {
        console.log('Room form closed with data:', room);
        this._roomFormCloseSub?.unsubscribe();
        this._roomFormDialogRef = null;
        this._roomFormCloseSub = null;
      }
    );
  }

  public deleteRoom(room: Room) {
    console.log('Deleting room:', room);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete room ' + room.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this._roomsService.deleteRoom(room._id!);
        await this.loadData();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Room Deleted',
          life: 3000,
        });
      },
    });
  }

  public openRoomDetails(room: Room) {
    this._router.navigate(['admin', 'rooms', room._id]);
  }

  private async loadData() {
    this._roomsService.getRooms();
  }
}
