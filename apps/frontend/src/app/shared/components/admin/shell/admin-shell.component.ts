import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar.component';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
})
export class AdminShellComponent {}
