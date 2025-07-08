import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Admin Dashboard</h1>
    <p>(Later: room attendance list goes here)</p>
    <a routerLink="">← Back</a>
  `,
})
export class AdminPage {}
