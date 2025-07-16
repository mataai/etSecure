import { OAuth2Namespace } from '@fastify/oauth2';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import { authPreValidator } from '../request-modifiers/auth.pre-validator';
import { ObjectId } from 'mongodb';
import { RoomModel } from '../models/room.model';
import { UserModel } from '../models/user.model';

declare module 'fastify' {
  interface FastifyInstance {
    customOauth2?: OAuth2Namespace;
  }
}

export default async function (fastify: FastifyInstance) {
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

      fs.mkdirSync('./uploads', { recursive: true });

      const savePath = `./uploads/${req.user.sub}.jpg`;
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

      const user = await fastify.mongo.db
        .collection('users')
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return reply.code(400).send({ error: 'User not found' });
      }

      if (user.bypassLeft <= 0 || user.bypassLeft === undefined) {
        return reply
          .code(403)
          .send({ error: 'No bypasses left, Contact Admin' });
      }

      const room = await fastify.mongo.db
        .collection<RoomModel>('rooms')
        .findOne({
          _id: new ObjectId(data.roomId),
          users: new ObjectId(userId), // ensure this is also ObjectId
        });

      if (!room) {
        return reply
          .code(404)
          .send({ error: 'Room not found or User not in room' });
      }

      const updatedUser = await fastify.mongo.db
        .collection<UserModel>('users')
        .findOneAndUpdate(
          { _id: new ObjectId(userId) },
          { $inc: { bypassLeft: -1 } },
          { returnDocument: 'after' }
        );

      if (!updatedUser) {
        return reply.code(500).send({ error: 'Failed to update user' });
      }

      fastify.mqttClient.publish(`rooms/${data.roomId}/command`, 'unlock');

      fastify.mongo.db.collection('attendances').insertOne({
        userId: new ObjectId(userId),
        roomId: new ObjectId(data.roomId),
        timestamp: new Date(),
        type: 'bypass',
      });

      reply.code(200).send({
        message: 'Bypass used successfully',
      });
    }
  );
}
