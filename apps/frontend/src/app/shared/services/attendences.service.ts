import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Attendance } from '@etsecure/data-contracts';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  protected _httpClient: HttpClient = inject(HttpClient);
  public getAllAttendances() {
    return firstValueFrom(
      this._httpClient.get<Attendance[]>(
        environment.backendUrl + `/rooms/attendances`
      )
    );
  }

  public getRoomAttendances(roomId: string) {
    return firstValueFrom(
      this._httpClient.get<Attendance[]>(
        environment.backendUrl + `/rooms/${roomId}/attendances`
      )
    );
  }

  public getUserAttendances(userId: string) {
    return firstValueFrom(
      this._httpClient.get<Attendance[]>(
        environment.backendUrl + `/users/${userId}/attendances`
      )
    );
  }
}
