import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar.component';
import { AppAdminSidebar } from '../admin-sidebar.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterModule, NavbarComponent, AppAdminSidebar, ToastModule],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
})
export class AdminShellComponent {
  public readonly items = [
    {
      id: 'dashboard-link',
      icon: 'pi pi-home',
      routerLink: '/admin',
    },
    {
      id: 'settings-link',
      icon: 'pi pi-cog',
      routerLink: '/admin/settings',
    },
    {
      id: 'profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
  ];
}
