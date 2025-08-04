import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../..//environment/environment';
import { firstValueFrom } from 'rxjs';
import { UserUpsertRequest, User } from '@etsecure/data-contracts';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private httpClient: HttpClient = inject(HttpClient);

  private _usersList = signal<User[]>([]);

  public users = this._usersList.asReadonly();

  public async getUserById(id: string) {
    const user = await firstValueFrom(
      this.httpClient.get<User>(environment.backendUrl + '/users/' + id),
    );
    return user;
  }

  public async getUsers() {
    return await firstValueFrom(
      this.httpClient.get<User[]>(environment.backendUrl + '/users'),
    ).then((users) => {
      this._usersList.set(users);
      return this._usersList;
    });
  }

  public async createUser(user: UserUpsertRequest) {
    return await firstValueFrom(
      this.httpClient.post<{ message: string }>(
        environment.backendUrl + '/users',
        user,
      ),
    ).then(async (users) => {
      await this.getUsers();
      return users;
    });
  }

  public async updateUser(id: User['_id'], user: UserUpsertRequest) {
    return await firstValueFrom(
      this.httpClient.put<{ message: string }>(
        environment.backendUrl + '/users/' + id,
        user,
      ),
    ).then(async (data) => {
      console.log('User updated successfully:', data);
      await this.getUsers();
      return data;
    });
  }

  public async updateSelfPicture(photo: File) {
    const formData = new FormData();
    formData.append('file', photo);
    return await firstValueFrom(
      this.httpClient.post<User>(
        environment.backendUrl + '/auth/picture',
        formData,
      ),
    ).then(async (user) => {
      await this.getUsers();
      return user;
    });
  }

  public async addBypassToUser(user: User) {
    await firstValueFrom(
      this.httpClient.post<{ message: string }>(
        environment.backendUrl + '/users/' + user._id + '/bypass',
        {},
      ),
    );
  }

  public async deleteUser(user: User) {
    await firstValueFrom(
      this.httpClient.delete<{ message: string }>(
        environment.backendUrl + '/users/' + user._id,
      ),
    ).catch((error) => {
      // Handle error appropriately, e.g., show a notification
      console.error('Error deleting user:', error);
    });

    await this.getUsers();
  }
}
