import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb';

const doorsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /doors - Get all doors
  fastify.get('/doors', async (request, reply) => {
    const doors = await fastify.mongo.db.collection('doors').find().toArray();
    return reply.code(200).send(doors);
  })

  // GET /doors/:id - Get a single door
  fastify.get('/doors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const door = await fastify.mongo.db.collection('doors').findOne({ _id: new ObjectId(id) });
    if (!door) {
      return reply.code(404).send({ error: 'Door not found' });
    }
    return reply.code(200).send(door);
  })

  // POST /doors - Create a door
  fastify.post('/doors', async (request, reply) => {
    const doorData = request.body as { name: string; location: string};
    if (!doorData.name || !doorData.location) {
      return reply.code(400).send({ error: 'Name and location are required' });
    }
    const result = await fastify.mongo.db.collection('doors').insertOne(doorData);
    return reply.code(201).send({ id: result.insertedId, ...doorData });
  })

  // PUT /doors/:id - Update a door
  fastify.put('/doors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const doorData = request.body as { name?: string; location?: string; status?: string };
    if (!doorData.name && !doorData.location && !doorData.status) {
      return reply.code(400).send({ error: 'At least one field (name, location, status) must be provided' });
    }

    if (doorData.status && !['open', 'closed'].includes(doorData.status)) {
      return reply.code(400).send({ error: 'Status must be either "open" or "closed"' });
    }

    if (doorData.status) {
        fastify.mqttClient.publish(`doors/${id}/status`, doorData.status, { qos: 1 });
        fastify.log.info(`Published status ${doorData.status} for door ${id}`);
    }

    const result = await fastify.mongo.db.collection('doors').updateOne({ _id: new ObjectId(id) }, 
      { $set: doorData }
    );
    if (result.matchedCount === 0) {
      return reply.code(404).send({ error: 'Door not found' });
    }
    if (result.modifiedCount === 0) {
      return reply.code(200).send({ message: 'No changes made' });
    }
    return reply.code(200).send({ message: 'Door updated successfully' });
  })

  // DELETE /doors/:id - Delete a door
  fastify.delete('/doors/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await fastify.mongo.db.collection('doors').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return reply.code(404).send({ error: 'Door not found' });
    }
    return reply.code(204).send();
  })
}

export default doorsRoutes
