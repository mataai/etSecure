import { FastifyPluginAsync } from 'fastify';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { groupPreValidator } from '../request-modifiers/groups.pre-validator';
import { ObjectId } from 'mongodb';
import { UserModel } from '../models/user.model';
import { RoomModel } from '../models/room.model';
import { AttendanceModel } from '../models/attendance.model';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const usersCollection = fastify.mongo.db.collection<UserModel>('users');
  const roomCollection = fastify.mongo.db.collection<RoomModel>('rooms');
  const attendanceCollection =
    fastify.mongo.db.collection<AttendanceModel>('attendances');
  // GET /users - Get all users
  fastify.get(
    '/users',
    //{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const users = await usersCollection.find().toArray();
      return reply.send(users);
    }
  );

  // GET /users/:id - Get user by ID
  fastify.get(
    '/users/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return reply.code(200).send(user);
    }
  );

  // POST /users - Create user
  fastify.post(
    '/users',
    //{ preValidation: [authPreValidator, groupPreValidator(["etsecure_admin"])] },
    async (request, reply) => {
      const data = request.body as {
        name: string;
        username: string;
        email: string;
      };

      if (!data.name || !data.username || !data.email) {
        return reply
          .code(400)
          .send({ error: 'Name, username, and email are required' });
      }

      const response = await fetch(
        process.env.AUTHENTIK_API_URL + '/api/v3/core/users/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AUTHENTIK_API_TOKEN}`,
          },
          body: JSON.stringify(request.body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error creating user:', errorData);
        return reply
          .code(response.status)
          .send({ message: 'Failed to create user' });
      }

      const { pk } = await response.json();

      const userData: Omit<UserModel, '_id'> = {
        ...data,
        authentik_id: pk.toString(), // Store the authentik UID
        bypassLeft: 0,
      };

      const dbres = usersCollection.insertOne(userData as UserModel);

      if (!dbres) {
        return reply
          .code(500)
          .send({ error: 'Failed to create user in database' });
      }

      return reply.code(201).send({ message: 'User created successfully' });
    }
  );

  // PUT /users/:id - Update user
  fastify.put(
    '/users/:id',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }
      const userData = request.body as {
        name?: string;
        email?: string;
        groups?: string[];
      };

      if (!userData.name && !userData.email && !userData.groups) {
        return reply.code(400).send({
          error: 'At least one field (name, email, groups) must be provided',
        });
      }

      delete userData['bypassLeft'];

      const result = await usersCollection.updateOne(
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
    }
  );

  // DELETE /users/:id - Delete user
  fastify.delete(
    '/users/:id',
    //{ preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const response = await fetch(
        `${process.env.AUTHENTIK_API_URL}/api/v3/core/users/${user.authentik_id}/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AUTHENTIK_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        //const errorData = await response.json();
        console.log('Error deleting user:', response);
        return reply
          .code(response.status)
          .send({ message: 'Failed to delete user' });
      }

      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

      if (!result.acknowledged) {
        return reply
          .code(500)
          .send({ error: 'Failed to delete user from database' });
      }

      return reply.code(200).send({ message: 'User deleted successfully' });
    }
  );

  fastify.get(
    '/users/:id/rooms',
    { preValidation: [authPreValidator] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      if (
        request.user._id.toString() !== id &&
        !request.user.groups.includes('etsecure_admin')
      ) {
        return reply.code(403).send({
          error:
            'Forbidden: You do not have permission to access this resource',
        });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const rooms = await roomCollection.find({ users: user._id }).toArray();
      return reply.code(200).send(rooms);
    }
  );

  fastify.get(
    '/users/:id/attendances',
    { preValidation: [authPreValidator] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      if (
        request.user._id.toString() !== id &&
        !request.user.groups.includes('etsecure_admin')
      ) {
        return reply.code(403).send({
          error:
            'Forbidden: You do not have permission to access this resource',
        });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const attendances = await attendanceCollection
        .aggregate([
          {
            $match: { userId: new ObjectId(id) },
          },
          {
            $lookup: {
              from: 'rooms',
              localField: 'roomId',
              foreignField: '_id',
              as: 'room',
            },
          },
          {
            $unwind: '$room',
          },
          {
            $project: {
              _id: 1,
              timestamp: 1,
              'room.name': 1,
              'room.location': 1,
            },
          },
        ])
        .toArray();

      return reply.code(200).send(attendances);
    }
  );

  // POST /users/:id/bypass - Add a bypass for user
  fastify.post(
    '/users/:id/bypass',
    {
      preValidation: [authPreValidator, groupPreValidator(['etsecure_admin'])],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!id) {
        return reply.code(400).send({ error: 'User ID is required' });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      try {
        await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { bypassLeft: 1 } }
        );
      } catch (error) {
        console.error('Error updating bypass count:', error);
        return reply
          .code(500)
          .send({ error: 'Failed to update bypass count in database' });
      }

      return reply
        .code(200)
        .send({ message: `Bypass added to ${user.name} sucessfully` });
    }
  );
};

export default userRoutes;
