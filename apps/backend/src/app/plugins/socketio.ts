import { ServiceAccount, UserAuthentik } from '@etsecure/data-contracts';
import { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';
import fp from 'fastify-plugin';
import fastifyIO from 'fastify-socket';

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyIO, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  fastify.ready().then(() => {
    const io = fastify['io'] as Server;
    console.log('Socket.IO server is ready');

    io.use(async (socket, next) => {
      const { token, jwt } = socket.handshake.auth;

      if (token) {
        const service = await fastify.mongo.db
          .collection<ServiceAccount>('services')
          .findOne({ tokens: token });

        if (!service) {
          return next(new Error('Authentication error: token invalid'));
        }

        socket.data.service = service;
        return next();
      } else if (jwt) {
        const userInfo = (await fastify.customOauth2.userinfo(
          jwt,
        )) as UserAuthentik;
        if (!userInfo || !userInfo.sub) {
          return next(new Error('Authentication error: token invalid'));
        }
        socket.data.user = userInfo;
        return next();
      }
      return next(new Error('Authentication error: token missing'));
    });

    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);

      // Handle custom events
      socket.on('message', (data: Buffer) => {
        console.log('Message received:', data.byteLength);

        if (!socket.data.service) {
          console.error('Service data not found on socket');
          return;
        }

        // Process the received data (e.g., log it, store it, etc.)

        // Save image to file
        // const filename = `images/image_${socket.id}.jpg`;
        // const filePath = join(process.cwd(), filename);          return next(new Error('Authentication error: token invalid'));

        // writeFile(filePath, data, (err) => {
        //   if (err) {
        //     console.error('Error saving file:', err);
        //   } else {
        //     console.log('File saved:', filePath);
        //   }
        // });

        // Echo the message back to the client
        io.emit('message', {
          image: data,
          roomId: String(socket.data.service.roomId),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
      });
    });
  });
});
