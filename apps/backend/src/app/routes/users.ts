import { FastifyPluginAsync } from 'fastify';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';
import { ObjectId } from 'mongodb';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users - Get all users
  fastify.get(
    '/users',
    { preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const users = await fastify.mongo.db.collection('users').find().toArray();
      return reply.send(users);
    }
  );

  // GET /users/:id - Get user by ID
  fastify.get('/users/:id', 
    { preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }
      const user = await fastify.mongo.db.collection('users').findOne({ _id: new ObjectId(id) });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return reply.code(200).send(user);
  });

  // POST /users - Create user
  fastify.post('/users',
    { preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {

      return reply.code(501).send({ error: 'Not Implemented' });
  });

  // PUT /users/:id - Update user
  fastify.put('/users/:id', { preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!id) {
      return reply.code(400).send({ error: 'User ID is required' });
    }
    const userData = request.body as { name?: string; email?: string; groups?: string[] };

    if (!userData.name && !userData.email && !userData.groups) {
      return reply.code(400).send({ error: 'At least one field (name, email, groups) must be provided' });
    }

    const result = await fastify.mongo.db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: userData }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    if (result.modifiedCount === 0) {
      return reply.code(200).send({ message: 'No changes made' });
    }
    return reply.code(200).send({ message: 'User updated successfully' });
  });

  // DELETE /users/:id - Delete user
  fastify.delete('/users/:id', { preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])] },  async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!id) {
      return reply.code(400).send({ error: 'User ID is required' });
    }
    const result = await fastify.mongo.db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return reply.code(200).send({ message: 'User deleted successfully' });
  });
};

export default userRoutes;
