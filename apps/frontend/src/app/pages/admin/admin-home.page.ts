import { Component, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Attendance } from '@etsecure/data-contracts';
import { AttendancesListComponent } from '../../shared/components/attendances/attendances-list.component';
import { AttendanceService, WebSocketService } from '../../shared/services';
import { Subject } from 'rxjs';

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
export class AdminPage {
  private _webSocketService = inject(WebSocketService);
  private _attendanceService = inject(AttendanceService);
  public logins = model<Attendance[]>([]);
  public Date = Date;

  public get connected$() {
    return this._webSocketService.connected$;
  }
  private _videoObservable = new Subject<StreamData>();
  public stream = this._videoObservable.asObservable();

  constructor() {
    // Load attendances when component initializes
    this._loadAttendances();
    this._initWebSocket();
  }

  private async _loadAttendances() {
    try {
      const attendances = await this._attendanceService.getAllAttendances();
      console.log('Loaded attendances:', attendances);
      this.logins.set(attendances);
    } catch (error) {
      console.error('Failed to load attendances:', error);
    }
  }

  private _initWebSocket() {
    console.log(this._webSocketService.connected);
    this._webSocketService.addListener(
      'message',
      (data: { image: ArrayBuffer; roomId: string }) => {
        console.log('Message received:', data);
        if (!data || !data.image || !data.roomId) {
          console.error('Invalid message format:', data);
          return;
        }
        const blob = new Blob([data.image], { type: 'image/jpeg' });
        const frame = URL.createObjectURL(blob);
        this._videoObservable.next({
          frame,
          roomId: data.roomId,
          timestamp: Date.now(),
        });
      },
    );
  }
}
