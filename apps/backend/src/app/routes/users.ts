import { FastifyPluginAsync } from 'fastify';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users - Get all users
  fastify.get('/users', async (request, reply) => {
    // Need Admin Authorization

    const users = await fastify.mongo.db.collection('users').find().toArray();
    return reply.send(users);
  });

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
