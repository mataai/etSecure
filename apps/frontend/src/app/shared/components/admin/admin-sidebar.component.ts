import { Component } from '@angular/core';
import { AppMenu } from '../app.menu';

@Component({
  selector: 'app-admin-sidebar',
  imports: [AppMenu],
  template: `
    <div class="layout-sidebar">
      <app-menu [menuItems]="items"></app-menu>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: fit-content;
      }
    `,
  ],
})
export class AppAdminSidebar {
  public items = [
    {
      label: 'Home',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-table',
          routerLink: ['/admin'],
        },
        {
          label: 'Users',
          icon: 'pi pi-fw pi-users',
          routerLink: ['users'],
        },
        {
          label: 'Rooms',
          icon: 'pi pi-fw pi-home',
          routerLink: ['rooms'],
        },
        {
          label: 'Service Accounts',
          icon: 'pi pi-fw pi-briefcase',
          routerLink: ['service-accounts'],
        },
      ],
    },
  ];
}
