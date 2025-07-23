import { ServiceAccountModel } from './../models/service-account.model';
import { UserAuthentik } from '@etsecure/data-contracts';
import { preValidationMetaHookHandler } from 'fastify/types/hooks';
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UserModel } from '../models/user.model';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserModel & UserAuthentik;
  }
}

export const servicePreValidator: preValidationMetaHookHandler = async (
  req,
  res
) => {
  req.log.info('authPreValidator called');

  const token = req.headers.authorization;
  if (!token) {
    res.status(401).send({ error: 'Unauthorized: Missing token' });
    throw new Error('Unauthorized');
  }

  const fastify: FastifyInstance = container.resolve('FastifyInstance');

  try {
    const serviceInfo = await fastify.mongo.db
      .collection<ServiceAccountModel>('services')
      .findOne({
        tokens: { $elemMatch: { token } },
      });

    if (!serviceInfo) {
      req.log.error('No service account found for the provided token');
      res.status(401).send({ error: 'Unauthorized: Invalid service token' });
      throw new Error('Unauthorized');
    }
  } catch (err) {
    req.log.error({ err }, 'Authentication failed');
    res.status(401).send({ error: 'Unauthorized: Auth error' });
    throw new Error('Unauthorized');
  }
};
