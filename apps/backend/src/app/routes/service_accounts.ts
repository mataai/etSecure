import { FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';
import {
  ServiceAccountUpsertRequest,
  ServiceAccountTypes,
} from '@etsecure/data-contracts';
import { ServiceAccountModel } from '../models/service-account.model';

const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  const serviceAccountCollection =
    fastify.mongo.db.collection<ServiceAccountModel>('services');

  // GET /services - Get all services
  fastify.get(
    '/service_accounts',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      try {
        const dbServices = await serviceAccountCollection.find().toArray();

        if (!dbServices) {
          return reply.code(404).send({ error: 'No services found' });
        }

        return reply.code(200).send(dbServices);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
      }
    }
  );

  // POST /services - Create a service
  fastify.post(
    '/service_accounts',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const serviceData = request.body as ServiceAccountUpsertRequest;

      if (!serviceData || typeof serviceData !== 'object') {
        return reply.code(400).send({ error: 'Invalid service data' });
      }

      if (
        !serviceData.name ||
        (serviceData.type === ServiceAccountTypes.PI && !serviceData.roomId)
      ) {
        if (!serviceData.name)
          return reply.code(400).send({ error: 'Name is required' });
        if (serviceData.type === ServiceAccountTypes.PI && !serviceData.roomId)
          return reply.code(400).send({ error: 'Room ID is required' });
      }

      const result = await serviceAccountCollection.insertOne({
        ...serviceData,
        tokens: [],
      } as unknown as ServiceAccountModel);
      return reply.code(201).send({ id: result.insertedId, ...serviceData });
    }
  );

  // PUT /services/:id - Update a service
  fastify.put(
    '/service_accounts/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const serviceData = request.body as ServiceAccountUpsertRequest;
      if (
        !serviceData.name &&
        serviceData.type === ServiceAccountTypes.PI &&
        !serviceData.roomId
      ) {
        if (serviceData.type === ServiceAccountTypes.PI)
          return reply.code(400).send({
            error: 'At least one field (name, roomId) must be provided',
          });
        else
          return reply.code(400).send({
            error: 'Name must be provided',
          });
      }

      const updatedServiceData: ServiceAccountModel = {
        ...serviceData,
        tokens: [],
      } as unknown as ServiceAccountModel;

      if (
        updatedServiceData.type === ServiceAccountTypes.PI &&
        serviceData.type === ServiceAccountTypes.PI
      ) {
        updatedServiceData.roomId = new ObjectId(serviceData.roomId);
      }

      const result = await serviceAccountCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedServiceData }
      );
      if (result.matchedCount === 0) {
        return reply.code(404).send({ error: 'service not found' });
      }
      if (result.modifiedCount === 0) {
        return reply.code(200).send({ message: 'No changes made' });
      }
      return reply.code(200).send({ message: 'service updated successfully' });
    }
  );

  // DELETE /services/:id - Delete a service
  fastify.delete(
    '/service_accounts/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await serviceAccountCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0) {
        return reply.code(404).send({ error: 'service not found' });
      }
      return reply.code(204).send();
    }
  );

  fastify.post(
    '/service_accounts/:id/token',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const service = await serviceAccountCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!service) {
        return reply.code(404).send({ error: 'Service Account not found' });
      }

      const token = [...Array(64)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');

      service.tokens.push(token);
      await serviceAccountCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { tokens: service.tokens } }
      );

      return reply.code(201).send({ token });
    }
  );

  fastify.delete(
    '/service_accounts/:id/token/:token',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id, token } = request.params as { id: string; token: string };
      const serviceAccount = await serviceAccountCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!serviceAccount) {
        return reply.code(404).send({ error: 'Service Account not found' });
      }

      const tokenIndex = serviceAccount.tokens.indexOf(token);
      if (tokenIndex === -1) {
        return reply.code(404).send({ error: 'Token not found' });
      }

      serviceAccount.tokens.splice(tokenIndex, 1);
      await serviceAccountCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { tokens: serviceAccount.tokens } }
      );

      return reply.code(204).send();
    }
  );
};

export default servicesRoutes;
