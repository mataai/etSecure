import { User, UserAuthentik } from '@etsecure/data-contracts';
import { preValidationMetaHookHandler } from 'fastify/types/hooks';
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UserModel } from '../models/user.model';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserModel & UserAuthentik;
  }
}

export const authPreValidator: preValidationMetaHookHandler = async (
  req,
  res
) => {
  req.log.info('authPreValidator called');

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ error: 'Unauthorized: Missing token' });
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1].trim();
  if (!token) {
    res.status(401).send({ error: 'Unauthorized: Invalid token format' });
    throw new Error('Unauthorized');
  }

  const fastify: FastifyInstance = container.resolve('FastifyInstance');

  try {
    const userInfo = (await fastify.customOauth2.userinfo(
      token
    )) as UserAuthentik;
    if (!userInfo || !userInfo.sub) {
      req.log.error('No user info returned from OAuth provider');
      res.status(401).send({ error: 'Unauthorized: Invalid user info' });
      throw new Error('Unauthorized');
    }

    const dbUser = await fastify.mongo.db
      .collection<UserModel>('users')
      .findOne({ authentik_id: userInfo.sub });

    if (!dbUser) {
      req.log.error(`No local user found for authentik_id ${userInfo.sub}`);
      res.status(401).send({ error: 'Unauthorized: User not found in DB' });
      throw new Error('Unauthorized');
    }

    // Combine local user and Authentik data
    req.user = { ...dbUser, ...userInfo };
  } catch (err) {
    req.log.error({ err }, 'Authentication failed');
    res.status(401).send({ error: 'Unauthorized: Auth error' });
    throw new Error('Unauthorized');
  }
};
