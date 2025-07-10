import { Component } from '@angular/core';
import { UsersListComponent } from '../../shared/components/users/users-list.component';

@Component({
  selector: 'app-users-list-page',
  imports: [UsersListComponent],
  template: ` <app-users-list> </app-users-list> `,
})
export class UsersListPage {}
