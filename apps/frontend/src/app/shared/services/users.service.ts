import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../..//environment/environment';
import { firstValueFrom } from 'rxjs';
import { UserAuthentik } from '@etsecure/data-contracts';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private httpClient: HttpClient = inject(HttpClient);

  private _usersList = signal<UserAuthentik[]>([]);

  public users = this._usersList.asReadonly();

  public async getUsers() {
    await firstValueFrom(
      this.httpClient.get<UserAuthentik[]>(environment.backendUrl + '/users')
    ).then((users) => this._usersList.set(users));
    return this.users;
  }
  public async deleteUser(user: UserAuthentik) {
    await firstValueFrom(
      this.httpClient.delete(environment.backendUrl + '/users/' + user.sub)
    ).catch((error) => {
      // Handle error appropriately, e.g., show a notification
      console.error('Error deleting user:', error);
    });

    await this.getUsers();
  }
  public async deleteUsers(users: UserAuthentik[]) {
    await firstValueFrom(
      this.httpClient.delete(environment.backendUrl + '/users', {
        body: { users },
      })
    ).catch((error) => {
      // Handle error appropriately, e.g., show a notification
      console.error('Error deleting user:', error);
    });

    await this.getUsers();
  }
}
