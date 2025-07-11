import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'; // Ensure you have oidc-client-ts installed
import { User } from '@etsecure/data-contracts';

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
    userStore: new WebStorageStateStore({
      store: localStorage,
    }),
  });

  private httpClient: HttpClient = inject(HttpClient);
  private router = inject(Router);

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

  public async isAuthenticated(): Promise<boolean> {
    // Implement your logic to check if the user is authenticated
    // This could be checking a token in local storage or a service call
    return !!(await this.getProfile());
  }

  public getProfile(): Promise<User> {
    return this.userManager.getUser().then((user) => {
      const profile = (user?.profile as unknown as User) || null;
      console.log('User profile:', profile);
      if (!profile) {
        console.error('User profile not found');
      }
      return profile;
    });
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

        // Redirect to the home page or any other page after successful login
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Login failed:', error);
        // Handle error appropriately, e.g., show a notification or redirect to an error page
      });
  }

  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('refreshToken');
    this.userManager
      .signoutRedirect()
      .then(() => {
        // Clear local storage or any other state management after logout
        this.router.navigate(['/auth/login']);
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        // Handle error appropriately, e.g., show a notification or redirect to an error page
      });
  }
}
