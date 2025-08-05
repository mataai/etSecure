import { Component, inject, model, OnDestroy, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Attendance, Room } from '@etsecure/data-contracts';
import { AttendancesListComponent } from '../../shared/components/attendances/attendances-list.component';
import {
  AttendanceService,
  RoomsService,
  WebSocketService,
} from '../../shared/services';
import { BehaviorSubject, Subscription } from 'rxjs';

interface StreamData {
  frame?: string;
  roomId?: string;
  timestamp?: number;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, CardModule, AttendancesListComponent],
  providers: [WebSocketService],
  templateUrl: './home/admin-home.page.html',
})
export class AdminPage implements OnDestroy {
  private _webSocketService = inject(WebSocketService);
  private _attendanceService = inject(AttendanceService);
  private _roomsService = inject(RoomsService);
  public logins = model<Attendance[]>([]);
  private rooms!: Signal<Room[]>;
  public currentRoom!: Room | null;
  public status = model<'disconnected' | 'idle' | 'live'>('disconnected');

  private _subscriptions: Subscription[] = [];

  public Date = Date;

  private _videoObservable = new BehaviorSubject<StreamData | null>(null);
  public stream = this._videoObservable.asObservable();

  constructor() {
    // Load attendances when component initializes
    this._loadAttendances();
    this._initWebSocket();
    this._roomsService.getRooms().then((rooms) => {
      this.rooms = rooms;
    });
    this._subscriptions.push(
      this._webSocketService.connected$.subscribe((connected) => {
        if (connected && this.status() === 'disconnected') {
          this.status.set('idle');
        } else if (!connected && this.status() !== 'disconnected') {
          this.status.set('disconnected');
        }
      }),
    );
    setInterval(() => {
      if (this.status() !== 'disconnected') {
        this.status.set(
          (this._videoObservable.value?.timestamp || 0) >= Date.now() - 2000
            ? 'live'
            : 'idle',
        );
      }
      if (this.status() !== 'live') {
        this.currentRoom = null; // Reset current room if not live
      }
    }, 2000); // Refresh stream status every 2 seconds
  }

  ngOnDestroy() {
    // Clean up WebSocket listeners when component is destroyed
    this._webSocketService.removeListener('message');
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private async _loadAttendances() {
    try {
      const attendances = await this._attendanceService.getAllAttendances();
      this.logins.set(attendances);
    } catch (error) {
      console.error('Failed to load attendances:', error);
    }
  }

  private _initWebSocket() {
    this._webSocketService.addListener(
      'message',
      (data: { image: ArrayBuffer; roomId: string }) => {
        // Check if the message is for the current room or if we are not live
        if (
          this._videoObservable.value?.roomId !== data.roomId &&
          this.status() === 'live'
        ) {
          return;
        }
        if (!data || !data.image || !data.roomId) {
          console.error('Invalid message format:', data);
          return;
        }
        const blob = new Blob([data.image], { type: 'image/jpeg' });
        const frame = URL.createObjectURL(blob);
        this.currentRoom =
          this.rooms()?.find((room) => room._id === data.roomId) || null;
        this._videoObservable.next({
          frame,
          roomId: data.roomId,
          timestamp: Date.now(),
        });
      },
    );
  }
}
