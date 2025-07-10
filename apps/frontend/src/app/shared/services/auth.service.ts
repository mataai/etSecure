import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { UserManager } from 'oidc-client-ts'; // Ensure you have oidc-client-ts installed

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userManager: UserManager = new UserManager({
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

  public isAuthenticated(): boolean {
    // Implement your logic to check if the user is authenticated
    // This could be checking a token in local storage or a service call
    return !!localStorage.getItem('authToken');
  }

  public login(): void {
    const backendUrl = environment.backendUrl;
    const uri = `${backendUrl}/auth/login`;
    const auto = false; // Set to true to automatically redirect after login
    const url = `${uri}?auto=${auto}`;
    this.httpClient.get<{ uri: string }>(url).subscribe({
      next: (response) => {
        if (response.uri) {
          window.location.href = response.uri; // Redirect to the OAuth login page
        } else {
          console.error('Login URI not found in response');
        }
      },
      error: (error) => {
        console.error('Error during login:', error);
        // Handle error appropriately, e.g., show a notification or redirect to an error page
      },
    });
  }
}
