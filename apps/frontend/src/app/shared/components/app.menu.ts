import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li
        app-menuitem
        *ngIf="!item.separator"
        [item]="item"
        [index]="i"
        [root]="true"
      ></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-table',
            routerLink: ['/admin'],
          },
        ],
      },
      {
        label: 'Users',
        items: [
          {
            label: 'List',
            icon: 'pi pi-fw pi-users',
            routerLink: ['users'],
          },
        ],
      },
      {
        label: 'Rooms',
        items: [
          {
            label: 'List',
            icon: 'pi pi-fw pi-home',
            routerLink: ['users'],
          },
        ],
      },
      {
        label: 'Logs',
        items: [
          {
            label: 'List',
            icon: 'pi pi-fw pi-file',
            routerLink: ['users'],
          },
        ],
      },
    ];
  }
}
