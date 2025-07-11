import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-shell',
  imports: [RouterModule, NavbarComponent],
  template: `
    <app-navbar [items]="navbarItems"></app-navbar>

    <router-outlet></router-outlet>
  `,
})
export class UserShellComponent {
  public navbarItems = [
    {
      id: 'dashboard-link',
      icon: 'pi pi-home',
      routerLink: '/home',
    },
    {
      id: 'profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
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
          this.navbarItems = [
            this.navbarItems[0],
            {
              id: 'settings-link',
              icon: 'pi pi-cog',
              routerLink: '/admin',
            },
            this.navbarItems[1],
          ];
        }
      });
    });
  }
}
