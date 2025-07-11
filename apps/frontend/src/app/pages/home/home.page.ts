import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <h1>Home</h1>
    <p>Welcome {{ name }}!</p>
    @switch (groups[0]) { @case ('etsecure_admin') {
    <p>You are an Admin. You can manage the system.</p>
    } @default {
    <p>You are a Student. You can access your courses.</p>
    } }
  `,
})
export class HomePage {
  private _authService = inject(AuthService);

  public groups: string[] = [];
  public name = '';

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        this.groups = profile.groups || [];
        this.name = profile.name || 'User';
      });
    });
  }
}
