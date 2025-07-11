import { FastifyPluginAsync } from 'fastify';
import { ObjectId } from 'mongodb';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';
import {
  RoomUpsertRequest,
  CreateAttendanceRequest,
  RoomAccessUpdateRequest,
} from '@etsecure/data-contracts';

const roomsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /rooms - Get all rooms
  fastify.get('/rooms', async (request, reply) => {
    const rooms = await fastify.mongo.db.collection('rooms').find().toArray();

    const roomUserIds = rooms
      .flatMap((room) => room?.users as ObjectId)
      .filter(Boolean);
    const users = await fastify.mongo.db
      .collection('users')
      .find({
        _id: { $in: roomUserIds || [] },
      })
      .toArray();

    rooms.forEach((room) => {
      if (room.users) {
        room.users = room.users
          .map((userId) => {
            const user = users.find(
              (u) => u._id.toString() === userId.toString()
            );
            return { id: user._id, name: user?.name };
          })
          .filter(Boolean);
      }
    });
    return reply.code(200).send(rooms);
  });

  // GET /rooms/:id - Get a single room
  fastify.get('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const room = await fastify.mongo.db
      .collection('rooms')
      .findOne({ _id: new ObjectId(id) });
    if (!room) {
      return reply.code(404).send({ error: 'room not found' });
    }
    const roomUsers = (
      await fastify.mongo.db
        .collection('users')
        .find({ _id: { $in: room.users || [] } })
        .toArray()
    ).map((user) => ({ id: user._id, name: user.name as string }));
    return reply.code(200).send({ ...room, users: roomUsers });
  });

  // POST /rooms - Create a room
  fastify.post(
    '/rooms',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const roomData = request.body as RoomUpsertRequest;

      if (!roomData || typeof roomData !== 'object') {
        return reply.code(400).send({ error: 'Invalid room data' });
      }

      if (!roomData.name || !roomData.location) {
        return reply
          .code(400)
          .send({ error: 'Name and location are required' });
      }
      const result = await fastify.mongo.db
        .collection('rooms')
        .insertOne(roomData);
      return reply.code(201).send({ id: result.insertedId, ...roomData });
    }
  );

  // PUT /rooms/:id - Update a room
  fastify.put(
    '/rooms/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const roomData = request.body as {
        name?: string;
        location?: string;
        status?: string;
      };
      if (!roomData.name && !roomData.location && !roomData.status) {
        return reply.code(400).send({
          error: 'At least one field (name, location, status) must be provided',
        });
      }

      if (
        roomData.status &&
        !['locked', 'unlocked'].includes(roomData.status)
      ) {
        return reply
          .code(400)
          .send({ error: 'Status must be either "locked" or "unlocked"' });
      }

      if (roomData.status) {
        fastify.mqttClient.publish(`rooms/${id}/status`, roomData.status, {
          qos: 1,
        });
        fastify.log.info(`Published status ${roomData.status} for room ${id}`);
      }

      const result = await fastify.mongo.db
        .collection('rooms')
        .updateOne({ _id: new ObjectId(id) }, { $set: roomData });
      if (result.matchedCount === 0) {
        return reply.code(404).send({ error: 'room not found' });
      }
      if (result.modifiedCount === 0) {
        return reply.code(200).send({ message: 'No changes made' });
      }
      return reply.code(200).send({ message: 'room updated successfully' });
    }
  );

  // DELETE /rooms/:id - Delete a room
  fastify.delete(
    '/rooms/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await fastify.mongo.db
        .collection('rooms')
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return reply.code(404).send({ error: 'room not found' });
      }
      return reply.code(204).send();
    }
  );

  fastify.get('/rooms/:id/users', async (request, reply) => {
    const { id } = request.params as { id: string };
    const room = await fastify.mongo.db
      .collection('rooms')
      .findOne({ _id: new ObjectId(id) });
    if (!room) {
      return reply.code(404).send({ error: 'room not found' });
    }

    const users = await fastify.mongo.db
      .collection('users')
      .find({ _id: { $in: room.users || [] } })
      .toArray();

    return reply.code(200).send(users);
  });

  // Update users access to a room
  fastify.put(
    '/rooms/:id/users',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userIds = (request.body as RoomAccessUpdateRequest).userIds;

      if (!userIds) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      const room = await fastify.mongo.db
        .collection('rooms')
        .findOne({ _id: new ObjectId(id) });
      if (!room) {
        return reply.code(404).send({ error: 'room not found' });
      }

      const users = await fastify.mongo.db
        .collection('users')
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .toArray();
      if (!users || users.length <= 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      if (!room.users) {
        room.users = [];
      }

      // Add new users to room and ensure no duplicates

      await fastify.mongo.db
        .collection('rooms')
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { users: users.map((user) => user._id) } }
        );

      return reply
        .code(200)
        .send({ message: 'User added to room successfully' });
    }
  );

  fastify.get(
    '/rooms/:id/attendances',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ error: 'Invalid room ID' });
      }

      const roomId = new ObjectId(id);

      const room = await fastify.mongo.db
        .collection('rooms')
        .findOne({ _id: roomId });
      if (!room) {
        return reply.code(404).send({ error: 'Room not found' });
      }

      const attendances = await fastify.mongo.db
        .collection('attendances')
        .aggregate([
          {
            $match: { roomId: new ObjectId(id) }, // Filter only attendances for this room
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $lookup: {
              from: 'rooms',
              localField: 'roomId',
              foreignField: '_id',
              as: 'room',
            },
          },
          { $unwind: '$room' },
        ])
        .toArray();

      return reply.code(200).send(attendances);
    }
  );

  fastify.get(
    '/rooms/attendances',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const attendances = await fastify.mongo.db
        .collection('attendances')
        .aggregate([
          {
            $lookup: {
              from: 'rooms', // collection name to join with
              localField: 'roomId', // field in attendances
              foreignField: '_id', // field in rooms (must be ObjectId)
              as: 'room', // result will be an array in 'room' field
            },
          },
          {
            $unwind: '$room', // flatten the array to just an object
          },
          {
            $lookup: {
              from: 'users', // collection name to join with
              localField: 'userId', // field in attendances
              foreignField: '_id', // field in users (must be ObjectId)
              as: 'user', // result will be an array in 'user' field
            },
          },
          {
            $unwind: '$user', // flatten the array to just an object
          },
        ])
        .toArray();

      return reply.code(200).send(attendances);
    }
  );

  fastify.post(
    '/rooms/:id/attendances',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { userId } = request.body as CreateAttendanceRequest;

      if (!userId) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      const room = await fastify.mongo.db
        .collection('rooms')
        .findOne({ _id: new ObjectId(id) });
      if (!room) {
        return reply.code(404).send({ error: 'room not found' });
      }

      const attendance = {
        roomId: new ObjectId(id),
        userId: new ObjectId(userId),
        timestamp: new Date(),
      };

      await fastify.mongo.db.collection('attendances').insertOne(attendance);
      return reply
        .code(201)
        .send({ message: 'Attendance recorded successfully', attendance });
    }
  );
};

export default roomsRoutes;
