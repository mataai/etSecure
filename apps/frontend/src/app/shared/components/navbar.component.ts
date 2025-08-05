import { WebcamImage } from 'ngx-webcam';
import { Component, input, model } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, StyleClassModule, MenubarModule],
  template: `
    <!-- <p-menubar [model]="items()">
      <ng-template #start>
        <img
          src="/etsecure-logo.svg"
          alt="etSecure Logo"
          style="height:40px;"
        />
        <span>
          <span style="color:inherit;">etS</span>
          <span style="color:white !important;">ecure</span>
        </span>
      </ng-template>
    </p-menubar> -->

    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <div class="lg:hidden">
          <button
            class="layout-menu-button layout-topbar-action "
            (click)="this.open.set(!open())"
          >
            <i class="pi pi-bars"></i>
          </button>
        </div>

        <a class="layout-topbar-logo" routerLink="/">
          <img
            src="/etsecure-logo.svg"
            alt="etSecure Logo"
            style="height:40px;"
          />
          <span>
            <span style="color:inherit;">etS</span>
            <span style="color:white !important;">ecure</span>
          </span>
        </a>
      </div>

      <div class="layout-topbar-actions">
        <button
          class="layout-topbar-menu-button layout-topbar-action"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>

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
                @if (item.label) {
                  <span>{{ item.label }}</span>
                }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      p-menubar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
      }
      .active {
        background-color: var(--primary-color);
        color: white;
      }
    `,
  ],
})
export class NavbarComponent {
  public readonly items = input.required<MenuItem[]>();
  public open = model<boolean>(false);
}
