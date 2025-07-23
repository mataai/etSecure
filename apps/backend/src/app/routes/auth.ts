import { OAuth2Namespace } from '@fastify/oauth2';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { ObjectId } from 'mongodb';
import { RoomModel } from '../models/room.model';
import { UserModel } from '../models/user.model';
import { RoomUnlockRequest } from '@etsecure/data-contracts';
import { AttendanceModel } from '../models/attendance.model';
import path from 'path';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyInstance {
    customOauth2?: OAuth2Namespace;
  }
}

export default async function (fastify: FastifyInstance) {
  const usersCollection = fastify.mongo.db.collection<UserModel>('users');
  const roomsCollection = fastify.mongo.db.collection<RoomModel>('rooms');
  const attendancesCollection =
    fastify.mongo.db.collection<AttendanceModel>('attendances');

  fastify.get('/auth/login', async function (req, res) {
    fastify.customOauth2.generateAuthorizationUri(
      req,
      res,
      async (err, uri) => {
        if (err) {
          return res.status(401).send({ error: 'Unauthorized' });
        }
        console.log(`Request received: ${req.method} ${req.url}`);

        res.redirect(uri);
      }
    );
  });

  fastify.get('/auth/callback', async function (req, res) {
    try {
      const token_data =
        await fastify.customOauth2.getAccessTokenFromAuthorizationCodeFlow(req);
      console.log('Access Token Data:', token_data);

      return token_data;
    } catch (err) {
      console.error('Error during authentication:', err);
      res.status(500).send({ error: 'Authentication failed' });
    }
  });

  fastify.get('/auth/profile', async function (req, res) {
    // get token from request header
    const token: string = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    console.log(token);
    try {
      const userInfo = await fastify.customOauth2.userinfo(token);
      console.log('User Info:', userInfo);
      return userInfo;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).send({ error: 'Failed to fetch user profile' });
    }
  });

  fastify.post(
    '/auth/picture',
    { preValidation: [authPreValidator] },
    async function (req, res) {
      const data = await req.file();

      if (!data) {
        console.log(req);
        return res.status(400).send({ error: 'No file uploaded' });
      }

      const file = data.file;

      if (!file) {
        return res.status(400).send({ error: 'File upload failed' });
      }

      const userFolderPath = `./uploads/${req.user._id}`
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(`./uploads/${req.user._id}`, { recursive: true });
      }

      

      const savePath = `./uploads/${req.user._id}/${randomUUID()}.jpg`;
      const writeStream = fs.createWriteStream(savePath);

      // Use a Promise to wait for the stream to finish
      await new Promise<void>((resolve, reject) => {
        file.pipe(writeStream);

        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      }).catch((err) => {
        console.error('Error writing file:', err);
        return res.status(500).send({ error: 'Failed to save file' });
      });

      writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
        return res.status(500).send({ error: 'Failed to save file' });
      });

      const io = fastify['io'] as Server;

      io.emit('train');

      return res.status(200).send({
        message: 'File uploaded successfully',
      });
    }
  );

  fastify.post(
    '/auth/bypass',
    { preValidation: [authPreValidator] },
    async function (request, reply) {
      const userId = request.user._id;
      const data = request.body as { roomId: string };

      if (!data) {
        return reply.code(400).send({ error: 'No data provided' });
      }

      if (!data.roomId) {
        return reply.code(400).send({ error: 'roomId is required' });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return reply.code(400).send({ error: 'User not found' });
      }

      if (user.bypassLeft <= 0 || user.bypassLeft === undefined) {
        return reply
          .code(403)
          .send({ error: 'No bypasses left, Contact Admin' });
      }

      const room = await roomsCollection.findOne({
        _id: new ObjectId(data.roomId),
        users: new ObjectId(userId), // ensure this is also ObjectId
      });

      if (!room) {
        return reply
          .code(404)
          .send({ error: 'Room not found or User not in room' });
      }

      const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $inc: { bypassLeft: -1 } },
        { returnDocument: 'after' }
      );

      if (!updatedUser) {
        return reply.code(500).send({ error: 'Failed to update user' });
      }

      fastify.mqttClient.publish(`rooms/${data.roomId}/command`, 'unlock');

      const attendance: Omit<AttendanceModel, '_id'> = {
        userId: new ObjectId(userId),
        roomId: new ObjectId(data.roomId),
        timestamp: new Date(),
        type: 'bypass',
      };

      try {
        attendancesCollection.insertOne(attendance as AttendanceModel);

        reply.code(200).send({
          message: 'Bypass used successfully',
        });
      } catch (error) {
        console.error('Error inserting attendance:', error);
        reply.code(500).send({ error: 'Failed to record attendance' });
      }
    }
  );

  fastify.post(
    '/auth/request-open',
    // { preValidation: [authPreValidator, groupPreValidator(['etsecure_ai'])] },
    async function (request, reply) {
      console.log("REQUEST RECEIVED")


      const data = request.body as RoomUnlockRequest;
      if (!data || !data.roomId || !data.userId || !data.timestamp) {
        return reply
          .code(400)
          .send({ error: 'roomId, userId, and timestamp are required' });
      }

      const user = await usersCollection.findOne({
        _id: new ObjectId(data.userId),
      });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const room = await roomsCollection.findOne({
        _id: new ObjectId(data.roomId),
        users: user._id
      });
      if (!room) {
        return reply.code(404).send({ error: 'Room not found' });
      }

      if (fastify.mqttClient?.connected) {
        fastify.mqttClient.publish(`rooms/${data.roomId}/command`, 'unlock');
      } else {
        console.error('Unlock command failed: MQTT client not connected');
      }
      const attendance: Omit<AttendanceModel, '_id'> = {
        userId: new ObjectId(data.userId),
        roomId: new ObjectId(data.roomId),
        timestamp: data.timestamp,
        type: 'unlock',
        // image: data.image, // Assuming image is a Buffer
      };

      try {
        await attendancesCollection.insertOne(attendance as AttendanceModel);
      } catch (error) {
        console.error('Error inserting attendance:', error);
        reply.code(500).send({ error: 'Failed to record attendance' });
      }

      reply.code(200).send({ message: 'Unlock command sent' });
    }
  );

  fastify.get('/auth/ai-models/:id',
    // { preValidation: [authPreValidator, groupPreValidator(['etsecure_device'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const filePath = path.resolve(`ai-models/${id}.pickle`);

      if (!fs.existsSync(filePath)) {
        reply.code(404).send({ message: 'Model not found'});
      }

      reply.header('Content-Type', 'application/octet-stream');
      reply.header('Content-Disposition', `attachment; filename="${id}.pickle"`)

      const fileStream = fs.createReadStream(filePath);
      reply.send(fileStream);
    }
  )
}
