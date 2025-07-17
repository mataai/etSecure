import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Room,
  RoomAccessUpdateRequest,
  RoomUpsertRequest,
} from '@etsecure/data-contracts';
import { Service } from './service';
import { environment } from './../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ServiceAccountsService extends Service<Room> {
  private _http: HttpClient = inject(HttpClient);

  // Placeholder methods for now
  public async getServiceAccounts() {
    return [];
  }

  public async getServiceAccount(id: string) {
    return null;
  }

  public async createServiceAccount(data: any) {
    return null;
  }

  public async updateServiceAccount(id: string, data: any) {
    return null;
  }

  public async deleteServiceAccount(id: string) {
    return null;
  }
} // TODO: Implement service account methods