import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../..//environment/environment';
import { firstValueFrom } from 'rxjs';
import { User } from '@etsecure/data-contracts';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private httpClient: HttpClient = inject(HttpClient);

  private _usersList = signal<User[]>([]);

  public users = this._usersList.asReadonly();

  public async getUsers() {
    await firstValueFrom(
      this.httpClient.get<User[]>(environment.backendUrl + '/users')
    ).then((users) => this._usersList.set(users));
    return this.users;
  }

  public async updateUser(user: User) {
    await firstValueFrom(
      this.httpClient.put<User>(
        environment.backendUrl + '/users/' + user._id,
        user
      )
    ).then(() => this.getUsers());
    return this.users;
  }

  public async updateSelfPicture(photo: File) {
    const formData = new FormData();
    formData.append('file', photo);

    await firstValueFrom(
      this.httpClient.put<User>(
        environment.backendUrl + '/auth/picture',
        formData
      )
    ).then(() => this.getUsers());

    return this.users;
  }

  public async createUser(user: User) {
    await firstValueFrom(
      this.httpClient.post<User>(environment.backendUrl + '/users', user)
    ).then(() => this.getUsers());

    return this.users;
  }

  public async deleteUser(user: User) {
    await firstValueFrom(
      this.httpClient.delete(environment.backendUrl + '/users/' + user._id)
    ).catch((error) => {
      // Handle error appropriately, e.g., show a notification
      console.error('Error deleting user:', error);
    });

    await this.getUsers();
  }
}
