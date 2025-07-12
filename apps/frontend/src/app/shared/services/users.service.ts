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
      this.httpClient.get<User>(environment.backendUrl + '/users/' + id)
    );
    return user;
  }

  public async getUsers() {
    await firstValueFrom(
      this.httpClient.get<User[]>(environment.backendUrl + '/users')
    ).then((users) => this._usersList.set(users));
    return this.users;
  }

  public async createUser(user: UserUpsertRequest) {
    try {
      await firstValueFrom(
        this.httpClient.post<{ message: string }>(
          environment.backendUrl + '/users',
          user
        )
      );
      await this.getUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw the error to handle it in the component
    }

    return;
  }

  public async updateUser(id: string, user: UserUpsertRequest) {
    try {
      await firstValueFrom(
        this.httpClient.put<{ message: string }>(
          environment.backendUrl + '/users/' + id,
          user
        )
      );
      await this.getUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw the error to handle it in the component
    }
    return;
  }

  public async updateSelfPicture(photo: File) {
    const formData = new FormData();
    formData.append('file', photo);
    try {
      await firstValueFrom(
        this.httpClient.put<User>(
          environment.backendUrl + '/auth/picture',
          formData
        )
      );
      await this.getUsers();
    } catch (error) {
      console.error('Error updating user picture:', error);
    }

    return;
  }

  public async deleteUser(user: User) {
    await firstValueFrom(
      this.httpClient.delete<{ message: string }>(
        environment.backendUrl + '/users/' + user._id
      )
    ).catch((error) => {
      // Handle error appropriately, e.g., show a notification
      console.error('Error deleting user:', error);
    });

    await this.getUsers();
  }
}
