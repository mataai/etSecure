export const environment = {
  production: false,
  backendUrl: 'http://localhost:3000', // URL of the backend server
  oidcAuthority: 'https://auth.etsecure.xyz/application/o/frontend/', // OIDC authority URL
  oidcClientId: 'REDACTED',
  oidcClientSecret: 'REDACTED',
  oidcRedirectUri: 'http://localhost:4200/auth/callback', // Redirect URI after login
};
