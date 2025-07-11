import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-shell',
  imports: [RouterModule],
  template: ` <router-outlet></router-outlet> `,
})
export class UserShellComponent {}
