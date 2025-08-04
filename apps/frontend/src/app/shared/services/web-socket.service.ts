import { inject, Injectable } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environment/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private _socket!: Nullable<Socket>;
  private _authService = inject(AuthService);

  private _connectedObservable = new BehaviorSubject<boolean>(false);

  public get connected(): boolean {
    return this._connectedObservable.value;
  }

  public get connected$() {
    return this._connectedObservable.pipe(distinctUntilChanged());
  }

  private _listenerInitQueue: {
    event: string;
    callback: (data: any) => void;
  }[] = [];

  constructor() {
    if (this._socket) {
      return;
    }
    this._init();
  }

  private async _init() {
    this._socket = io(environment.backendUrl, {
      auth: { jwt: await this._authService.asyncToken },
    });
    this._socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this._socket = null;
      this._connectedObservable.next(false);
    });
    this._socket.on('connect', () => {
      console.log('WebSocket connected');
      for (const { event, callback } of this._listenerInitQueue) {
        this._socket?.on(event, callback);
      }
      console.log('All queued listeners have been initialized');
      this._listenerInitQueue = [];
      this._connectedObservable.next(true);
    });

    this._socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this._socket = null;
      this._connectedObservable.next(false);
    });

    this._socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  public addListener(event: string, callback: (data: any) => void) {
    if (!this._socket) {
      console.warn('WebSocket is not initialized');
      this._listenerInitQueue.push({ event, callback });
      return;
    }

    this._socket.on(event, callback);
  }

  public removeListener(event: string) {
    if (!this._socket) {
      console.warn('WebSocket is not initialized');
      return;
    }

    this._socket.off(event);
  }
}
