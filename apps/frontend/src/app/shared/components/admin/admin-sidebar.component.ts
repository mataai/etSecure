import { Component } from '@angular/core';
import { AppMenu } from '../app.menu';

@Component({
  selector: 'app-admin-sidebar',
  imports: [AppMenu],
  template: ` <div class="layout-sidebar">
    <app-menu></app-menu>
  </div>`,
  styles: [
    `
      :host{
        display: block;
        height: 100%;
        width: fit-content;
      }
    `,
  ],
})
export class AppAdminSidebar {}
