import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterModule,  
  ],
  templateUrl: './app.html',
  styleUrls:   ['./app.scss'],
})
export class AppComponent {}
