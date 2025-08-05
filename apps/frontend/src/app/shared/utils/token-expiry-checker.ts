import { User } from 'oidc-client-ts';

const expirationBufferSeconds = 30000; // 30 seconds buffer

export function isTokenExpired(token: string | User | null): boolean {
  if (!token) {
    return true;
  }

  if (typeof token === 'string') {
    return isStringTokenExpired(token);
  } else {
    return isObjectTokenExpired(token);
  }
}

function isStringTokenExpired(token: string | null | undefined): boolean {
  if (!token) {
    return true;
  }
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (!decodedPayload.exp) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < now - expirationBufferSeconds;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

function isObjectTokenExpired(token: User): boolean {
  if (!token || !token.expires_at) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return token.expires_at < now - expirationBufferSeconds;
}
