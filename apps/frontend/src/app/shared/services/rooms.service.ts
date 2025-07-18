import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Room,
  RoomAccessUpdateRequest,
  RoomUpsertRequest,
} from '@etsecure/data-contracts';
import { Service } from './service';
import { environment } from './../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class RoomsService extends Service<Room> {
  public async getRooms() {
    await firstValueFrom(
      this._httpClient.get<Room[]>(environment.backendUrl + '/rooms')
    ).then((response) => this._dataList.set(response));
    return this.data;
  }

  public async getRoom(id: string) {
    return await firstValueFrom(
      this._httpClient.get<Room>(`${environment.backendUrl}/rooms/${id}`)
    );
  }

  public async createRoom(room: RoomUpsertRequest) {
    return await firstValueFrom(
      this._httpClient.post<Room>(environment.backendUrl + '/rooms', room)
    ).then(async (response) => {
      await this.getRooms();
      return response;
    });
  }

  public async setAllowedUsersInRoom(
    roomId: string,
    request: RoomAccessUpdateRequest
  ) {
    return await firstValueFrom(
      this._httpClient.put<void>(
        `${environment.backendUrl}/rooms/${roomId}/users`,
        request
      )
    );
  }

  public async disallowUserToRoom(roomId: string, userId: string) {
    return await firstValueFrom(
      this._httpClient.delete<void>(
        `${environment.backendUrl}/rooms/${roomId}/users/${userId}`
      )
    );
  }

  public async updateRoom(id: string, room: RoomUpsertRequest) {
    return await firstValueFrom(
      this._httpClient.put<Room>(`${environment.backendUrl}/rooms/${id}`, room)
    ).then(async (response) => {
      await this.getRooms();
      return response;
    });
  }

  public async deleteRoom(id: string) {
    return await firstValueFrom(
      this._httpClient.delete<void>(`${environment.backendUrl}/rooms/${id}`)
    ).then(() => {
      this.getRooms();
    });
  }

  public async requestBypass(roomId: string) {
    await firstValueFrom(
      this._httpClient.post(`${environment.backendUrl}/auth/bypass`, { roomId })
    );
  }
}
