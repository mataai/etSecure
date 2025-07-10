export const environment = {
  production: false,
  backendUrl: 'http://localhost:3000', // URL of the backend server
  oidcAuthority: 'https://auth.etsecure.xyz/application/o/frontend/', // OIDC authority URL
  oidcClientId: '5ex0iLMCLMET50aKQIDwvkRoUpCrDs41dIK5N8q8',
  oidcClientSecret: 'AVsXzzggj0yWIbgCUfMCrvtISSdyDiwIinEkRi1PUIq1j9LWLOr82bUcTGihoMg0QYrZNg7Zemvdub26BW6Ag9fBzALgjxPUFHavhExR3EGiwMHK9XbUghGwY7EplUBE',
  oidcRedirectUri: 'http://localhost:4200/auth/callback', // Redirect URI after login
};
