import { User } from '@etsecure/data-contracts';
import { preValidationMetaHookHandler } from 'fastify/types/hooks';
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

export const authPreValidator: preValidationMetaHookHandler = (
  req,
  res,
  done
) => {
  req.log.info('authPreValidator called');
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ error: 'Unauthorized' });
    return done(new Error('Unauthorized'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).send({ error: 'Unauthorized' });
    return done(new Error('Unauthorized'));
  }

  const fastify: FastifyInstance = container.resolve('FastifyInstance');

  fastify.customOauth2
    .userinfo(token)
    .then((userInfo: User) => {
      if (!userInfo) {
        req.log.error('User info not found');
        res.status(401).send({ error: 'Unauthorized' });
        return done(new Error('Unauthorized'));
      }
      // todo: get local user from database
      req.user = userInfo;
      done();
    })
    .catch((err: Error) => {
      req.log.error('Error fetching user info:', err);
      res.status(401).send({ error: 'Unauthorized' });
      return done(new Error('Unauthorized'));
    });
};
