import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import oauthPlugin from '@fastify/oauth2';

/**
 * This plugins adds authentication using OAuth2.
 * It uses the @fastify/oauth2 plugin to handle OAuth2 flows.
 */
export default fp(async function (fastify: FastifyInstance) {
  const oauthScopes = process.env.OAUTH_SCOPES?.split(' ') || [
    'openid',
    'profile',
    'email',
  ];
  if (!process.env.OAUTH_SCOPES) {
    console.warn(
      'OAUTH_SCOPES environment variable is not set. Using default scopes: openid, profile, email.'
    );
  }

  const oauthIssuerUrl = process.env.OAUTH_ISSUER_URL;
  if (!oauthIssuerUrl) {
    console.error(
      'OAUTH_ISSUER_URL environment variable is not set. Please set to enable OAuth2 authentication.'
    );
    return;
  }
  const oauthClientId = process.env.OAUTH_CLIENT_ID;
  if (!oauthClientId) {
    console.error(
      'OAUTH_CLIENT_ID environment variable is not set. Please set to enable OAuth2 authentication.'
    );
    return;
  }
  const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!oauthClientSecret) {
    console.error(
      'OAUTH_CLIENT_SECRET environment variable is not set. Please set to enable OAuth2 authentication.'
    );
    return;
  }
  const oauthCallbackUri =
    process.env.OAUTH_CALLBACK_URI || 'http://localhost:3000/auth/callback';
  if (!process.env.OAUTH_CALLBACK_URI) {
    console.error(
      'OAUTH_CALLBACK_URI environment variable is not set. Using default: http://localhost:3000/auth/callback'
    );
    return;
  }
  fastify.register(oauthPlugin, {
    name: 'customOauth2',
    scope: oauthScopes,
    credentials: {
      client: {
        id: oauthClientId,
        secret: oauthClientSecret,
      },
    },
    callbackUri: oauthCallbackUri,
    discovery: {
      issuer: oauthIssuerUrl,
    },
  });
});
