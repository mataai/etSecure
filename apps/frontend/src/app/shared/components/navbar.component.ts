import { Component, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, StyleClassModule],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <a class="layout-topbar-logo" routerLink="/">
        <img src="/etsecure-logo.svg" alt="etSecure Logo" style="height:40px;" />
        <span><span style="color:inherit;">etS</span><span style="color:white !important;">ecure</span></span>
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          @for (item of items(); track item.id) {
          <button
            type="button"
            class="layout-topbar-action"
            [routerLink]="[item.routerLink]"
            routerLinkActive="active"
          >
            <i class="pi {{ item.icon }}"></i>
            @if(item.label) {
            <span>{{ item.label }}</span
            >}
          </button>
          }
        </div>
      </div>
    </div>
  </div>`,

  styles: [
    `
      .active {
        background-color: var(--primary-color);
        color: white;
      }
    `,
  ],
})
export class NavbarComponent {
  public readonly items = input.required<MenuItem[]>();
}
