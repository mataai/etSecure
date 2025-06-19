import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyIO from 'fastify-socket';
import { Server } from "socket.io";

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
      socket.on('message', (data) => {
        console.log('Message received:', data);
        // Echo the message back to the client
        socket.emit('message', `Echo: ${data}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
      });
    });
  });
});
