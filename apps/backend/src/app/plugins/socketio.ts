import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyIO from 'fastify-socket';
import { Server } from 'socket.io';

/**
 *
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyIO);

  fastify.ready().then(() => {
    const io = fastify['io'] as Server;
    console.log('Socket.IO server is ready');
    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);

      // Handle custom events
      socket.on('message', (data: Buffer) => {
        console.log('Message received:', data.byteLength);
        // Process the received data (e.g., log it, store it, etc.)


        try {
          if (fastify.mqttClient?.connected)
            fastify.mqttClient.publish('test', 'open');
        } catch (error) {
          console.error('Error publishing to MQTT:', error);
        }

        // Save image to file
        // const filename = `images/image_${socket.id}.jpg`;
        // const filePath = join(process.cwd(), filename);
        // writeFile(filePath, data, (err) => {
        //   if (err) {
        //     console.error('Error saving file:', err);
        //   } else {
        //     console.log('File saved:', filePath);
        //   }
        // });

        // Echo the message back to the client
        io.emit('message', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
      });
    });
  });
});
