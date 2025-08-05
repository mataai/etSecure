import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar.component';
import { AppAdminSidebar } from '../admin-sidebar.component';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-shell',
  imports: [CommonModule, RouterModule, NavbarComponent, AppAdminSidebar],
  template: `
    <div
      class="layout-wrapper layout-static"
      [ngClass]="{
        'layout-mobile-active': open(),
      }"
    >
      <app-navbar [items]="items" [(open)]="open"></app-navbar>
      <app-admin-sidebar></app-admin-sidebar>
      <div class="layout-main-container">
        <div class="layout-main">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  public open = model(false);
  private _subscription!: Subscription;

  constructor() {
    if (!this._subscription) {
      this._subscription = inject(Router).events.subscribe((event) => {
        if (event.constructor.name === 'NavigationEnd') {
          this.open.set(false); // Close sidebar on navigation
        }
      });
    }
  }

  public readonly items: MenuItem[] = [
    {
      id: 'dashboard-link',
      icon: 'pi pi-home',
      routerLink: '/home',
      label: 'Dashboard',
    },
    {
      id: 'settings-link',
      icon: 'pi pi-cog',
      routerLink: '/admin',
      label: 'Admin Dashboard',
    },
    {
      id: 'profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
      label: 'Profile',
    },
  ];
}
