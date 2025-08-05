import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';
import { AuthService } from '../../services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-shell',
  imports: [RouterModule, NavbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar [items]="items"></app-navbar>
      <div class="layout-main-container">
        <div class="layout-main">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class UserShellComponent {
  public items: MenuItem[] = [
    {
      id: 'dashboard-link',
      icon: 'pi pi-home',
      routerLink: '/home',
      label: 'Dashboard',
    },
    {
      id: 'profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
      label: 'Profile',
    },
  ];

  private _authService = inject(AuthService);

  constructor() {
    effect(() => {
      this._authService.getProfile().then((profile) => {
        // Only show the gear icon if user is in admin group
        const isAdmin =
          Array.isArray(profile.groups) &&
          profile.groups.includes('etsecure_admin');
        if (isAdmin) {
          this.items = [
            this.items[0],
            {
              id: 'settings-link',
              icon: 'pi pi-cog',
              routerLink: '/admin',
              label: 'Admin Dashboard',
            },
            this.items[1],
          ];
        }
      });
    });
  }
}
