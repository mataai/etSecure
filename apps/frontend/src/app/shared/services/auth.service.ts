import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { User, UserManager } from 'oidc-client-ts'; // Ensure you have oidc-client-ts installed

@Injectable({ providedIn: 'root' })
export class AuthService {
  public userManager: UserManager = new UserManager({
    authority: environment.oidcAuthority,
    client_id: environment.oidcClientId,
    client_secret: environment.oidcClientSecret,
    redirect_uri: environment.oidcRedirectUri,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    automaticSilentRenew: true,
  });

  private httpClient: HttpClient = inject(HttpClient);
  private router = inject(Router);

  /**
   *
   */
  constructor() {
    this.userManager
      .getUser()
      .then((user) => {
        if (user) {
          console.log('User is already logged in:', user);
          // Optionally, you can store user info in local storage or a service
        } else {
          console.log('No user logged in.');
        }
      })
      .catch((error) => {
        console.error('Error getting user:', error);
        // Handle error appropriately, e.g., show a notification or redirect to an error page
      });
  }

  public isAuthenticated(): boolean {
    // Implement your logic to check if the user is authenticated
    // This could be checking a token in local storage or a service call
    return !!localStorage.getItem('authToken');
  }

  public getProfile() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

  public login(): void {
    this.userManager.signinRedirect().catch((error) => {
      console.error('Error during login:', error);
      // Handle error appropriately, e.g., show a notification or redirect to an error page
    });
  }

  public handleCallback(): void {
    this.userManager
      .signinCallback()
      .then((user) => {
        if (!user) {
          console.error('No user information returned from OIDC provider.');
          return;
        }
        console.log('Login successful:', user);
        const authToken = user.access_token;
        const userInfo = user.profile;
        const refreshToken = user.refresh_token;

        // Store the tokens and user information in local storage or a service
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('refreshToken', refreshToken || '');

        // Redirect to the home page or any other page after successful login
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Login failed:', error);
        // Handle error appropriately, e.g., show a notification or redirect to an error page
      });
  }
}
