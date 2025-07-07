import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import oauthPlugin from '@fastify/oauth2';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(oauthPlugin, {
    name: 'customOauth2',
    scope: ['openid', 'profile', 'email'],
    credentials: {
      client: {
        id: 'sf9yb0lJVJkHjTCGPaUhiBb7eqyhVDSbZzT2LqLq',
        secret:
          'gD4sqQGeRN6dvFJfw8D5LUn3SojcMnTxInSADLM7pUx7H2zGA93QCGKh2LfJjgeiA9hKM7N4L8hxJmkAOEs5H8WCkF7TTsynk1n8Tle12dAdWradl7xa0BSrkh0URpr4',
      },
    },
    startRedirectPath: '/login',
    callbackUri: 'http://localhost:3000/auth/callback',
    callbackUriParams: {
      exampleParam: 'example param value',
    },
    discovery: {
      issuer: 'http://cloud-ind520:9000/application/o/backend/',
    },
  });
});
