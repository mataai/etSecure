import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';

const roomsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /rooms - Get all rooms
  fastify.get('/rooms', async (request, reply) => {
    const rooms = await fastify.mongo.db.collection('rooms').find().toArray();
    return reply.code(200).send(rooms);
  })

  // GET /rooms/:id - Get a single room
  fastify.get('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const room = await fastify.mongo.db.collection('rooms').findOne({ _id: new ObjectId(id) });
    if (!room) {
      return reply.code(404).send({ error: 'room not found' });
    }
    return reply.code(200).send(room);
  })

  // POST /rooms - Create a room
  fastify.post('/rooms',
    { preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const roomData = request.body as { name: string; location: string};

      if (!roomData || typeof roomData !== 'object') {
        return reply.code(400).send({ error: 'Invalid room data' });
      }

      if (!roomData.name || !roomData.location) {
        return reply.code(400).send({ error: 'Name and location are required' });
      }
      const result = await fastify.mongo.db.collection('rooms').insertOne(roomData);
      return reply.code(201).send({ id: result.insertedId, ...roomData });
  })

  // PUT /rooms/:id - Update a room
  fastify.put('/rooms/:id',
    //{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const roomData = request.body as { name?: string; location?: string; status?: string };
      if (!roomData.name && !roomData.location && !roomData.status) {
        return reply.code(400).send({ error: 'At least one field (name, location, status) must be provided' });
      }

      if (roomData.status && !['locked', 'unlocked'].includes(roomData.status)) {
        return reply.code(400).send({ error: 'Status must be either "locked" or "unlocked"' });
      }

      if (roomData.status) {
          fastify.mqttClient.publish(`rooms/${id}/status`, roomData.status, { qos: 1 });
          fastify.log.info(`Published status ${roomData.status} for room ${id}`);
      }

      const result = await fastify.mongo.db.collection('rooms').updateOne({ _id: new ObjectId(id) }, 
        { $set: roomData }
      );
      if (result.matchedCount === 0) {
        return reply.code(404).send({ error: 'room not found' });
      }
      if (result.modifiedCount === 0) {
        return reply.code(200).send({ message: 'No changes made' });
      }
      return reply.code(200).send({ message: 'room updated successfully' });
  })

  // DELETE /rooms/:id - Delete a room
  fastify.delete('/rooms/:id',{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await fastify.mongo.db.collection('rooms').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return reply.code(404).send({ error: 'room not found' });
    }
    return reply.code(204).send();
  })

  fastify.get('/rooms/:id/members', async (request, reply) => {
    const { id } = request.params as { id: string };
    const room = await fastify.mongo.db.collection('rooms').findOne({ _id: new ObjectId(id) });
    if (!room) {
      return reply.code(404).send({ error: 'room not found' });
    }

    const members = await fastify.mongo.db.collection('users').find({ _id: { $in: room.members || [] } }).toArray();
    return reply.code(200).send(members);
  })

  fastify.post('/rooms/:id/members',
    //{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId: string };

      if (!userId) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      const room = await fastify.mongo.db.collection('rooms').findOne({ _id: new ObjectId(id) });
      if (!room) {
        return reply.code(404).send({ error: 'room not found' });
      }

      const user = await fastify.mongo.db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      if (!room.members) {
        room.members = [];
      }

      if (room.members.includes(user._id)) {
        return reply.code(400).send({ error: 'User is already a member of this room' });
      }

      room.members.push(user._id);
      await fastify.mongo.db.collection('rooms').updateOne({ _id: new ObjectId(id) }, { $set: { members: room.members } });

      return reply.code(200).send({ message: 'User added to room successfully' });
  });

  fastify.delete('/rooms/:id/members/:userId',
    //{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const { id, userId } = request.params as { id: string; userId: string };

      const user = await fastify.mongo.db.collection('rooms').findOneAndDelete({ _id: new ObjectId(id), members: { $in: [new ObjectId(userId)] } });

      if (!user) {
        return reply.code(404).send({ error: 'room or user not found' });
      }

      return reply.code(200).send({ message: 'User removed from room successfully' });
  });
}

export default roomsRoutes
