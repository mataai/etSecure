import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  template: `<H1>LOGOUT</H1>`,
})
export class LogoutPage implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.logout();
  }
}
