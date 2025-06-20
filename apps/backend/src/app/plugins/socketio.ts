import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyIO from 'fastify-socket';
import { Server } from "socket.io";
import { writeFile } from 'fs';
import { join } from 'path';

/**
 *
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyIO);

  fastify.ready().then(() => {
    const io = fastify['io'] as Server;
    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);

      // Handle custom events
      socket.on('message', (data: Buffer) => {
        console.log('Message received:', data.byteLength);
        // Process the received data (e.g., log it, store it, etc.)

        const filename = `images/image_${socket.id}.jpg`;
        const filePath = join(process.cwd(), filename);

        fastify.mqttClient.publish('test', 'open');

        writeFile(filePath, data, (err) => {
          if (err) {
            console.error('Error saving file:', err);
          } else {
            console.log('File saved:', filePath);
          }
        });

        // Echo the message back to the client
        io.emit('message', `Broadcast: ${data}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
      });
    });
  });
});
