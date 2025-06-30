import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Home</h1>
    <p>Welcome! Choose your role:</p>
    <button routerLink="student">I am a Student</button>
    <button routerLink="admin">I am an Admin</button>
  `,
})
export class HomePage {}
