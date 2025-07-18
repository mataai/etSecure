import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ServiceAccount,
  ServiceAccountUpsertRequest,
} from '@etsecure/data-contracts';
import { Service } from './service';
import { environment } from './../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ServiceAccountsService extends Service<ServiceAccount> {
  // Placeholder methods for now
  public async getServiceAccounts() {
    await firstValueFrom(
      this._httpClient.get<ServiceAccount[]>(
        environment.backendUrl + '/service_accounts'
      )
    ).then((response) => this._dataList.set(response));
    return this.data;
  }

  public async getServiceAccount(id: string) {
    return await firstValueFrom(
      this._httpClient.get<ServiceAccount>(
        `${environment.backendUrl}/service_accounts/${id}`
      )
    );
  }

  public async createServiceAccount(
    serviceaccount: ServiceAccountUpsertRequest
  ) {
    return await firstValueFrom(
      this._httpClient.post<ServiceAccount>(
        environment.backendUrl + '/service_accounts',
        serviceaccount
      )
    ).then(async (response) => {
      await this.getServiceAccounts();
      return response;
    });
  }

  public async updateServiceAccount(
    id: string,
    serviceaccount: ServiceAccountUpsertRequest
  ) {
    return await firstValueFrom(
      this._httpClient.put<ServiceAccount>(
        `${environment.backendUrl}/service_accounts/${id}`,
        serviceaccount
      )
    ).then(async (response) => {
      await this.getServiceAccounts();
      return response;
    });
  }

  public async deleteServiceAccount(id: string) {
    return await firstValueFrom(
      this._httpClient.delete<void>(
        `${environment.backendUrl}/service_accounts/${id}`
      )
    ).then(() => {
      this.getServiceAccounts();
    });
  }

  public async requestServiceAccountToken(id: string) {
    return await firstValueFrom(
      this._httpClient.post<{ token: string }>(
        `${environment.backendUrl}/service_accounts/${id}/token`,
        {}
      )
    ).then((response) => response.token);
  }

  public async removeServiceAccountToken(id: string, token: string) {
    return await firstValueFrom(
      this._httpClient.delete<void>(
        `${environment.backendUrl}/service_accounts/${id}/token/${token}`
      )
    );
  }
}
