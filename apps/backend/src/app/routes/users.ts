import { FastifyPluginAsync } from 'fastify';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';

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
  fastify.get('/users/:id', async (request, reply) => {
    return reply.code(501).send({ error: 'Not Implemented' });
  });

  // POST /users - Create user
  fastify.post('/users', async (request, reply) => {
    return reply.code(501).send({ error: 'Not Implemented' });
  });

  // PUT /users/:id - Update user
  fastify.put('/users/:id', async (request, reply) => {
    return reply.code(501).send({ error: 'Not Implemented' });
  });

  // DELETE /users/:id - Delete user
  fastify.delete('/users/:id', async (request, reply) => {
    return reply.code(501).send({ error: 'Not Implemented' });
  });
};

export default userRoutes;
