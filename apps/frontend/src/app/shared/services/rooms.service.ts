import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CreateAttendanceRequest,
  Room,
  RoomUpsertRequest,
} from '@etsecure/data-contracts';
import { Service } from './service';
import { environment } from './../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class RoomsService extends Service<Room> {
  private _http: HttpClient = inject(HttpClient);

  public async getRooms() {
    await firstValueFrom(
      this._http.get<Room[]>(environment.backendUrl + '/rooms')
    ).then((response) => this._dataList.set(response));
    return this.data;
  }

  public async getRoom(id: string) {
    return await firstValueFrom(
      this._http.get<Room>(`${environment.backendUrl}/rooms/${id}`)
    );
  }

  public async createRoom(room: RoomUpsertRequest) {
    return await firstValueFrom(
      this._http.post<Room>(environment.backendUrl + '/rooms', room)
    ).then(async (response) => {
      await this.getRooms();
      return response;
    });
  }

  public async allowUserToRoom(
    roomId: string,
    request: CreateAttendanceRequest
  ) {
    return await firstValueFrom(
      this._http.post<void>(`${environment.backendUrl}/rooms/${roomId}/users`, {
        request,
      })
    );
  }

  public async disallowUserToRoom(roomId: string, userId: string) {
    return await firstValueFrom(
      this._http.delete<void>(
        `${environment.backendUrl}/rooms/${roomId}/users/${userId}`
      )
    );
  }

  public async updateRoom(id: string, room: RoomUpsertRequest) {
    return await firstValueFrom(
      this._http.put<Room>(`${environment.backendUrl}/rooms/${id}`, room)
    ).then(async (response) => {
      await this.getRooms();
      return response;
    });
  }

  public async deleteRoom(id: string) {
    return await firstValueFrom(
      this._http.delete<void>(`${environment.backendUrl}/rooms/${id}`)
    ).then(() => {
      this.getRooms();
    });
  }
}
