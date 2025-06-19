import fastify, { FastifyInstance } from 'fastify'
import testRouter from './test.router';
import fastifyIO from "fastify-socket";
import { Server } from "socket.io";

const server = fastify({ logger: true }) as unknown as FastifyInstance & {
  io: Server;
};
server.register(fastifyIO)

server.get('/ping', async (request, reply) => {
  return 'pong'
})

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);
    // Example of handling a custom event
    socket.on("message", (data) => {
      console.log("Received customEvent with data:", data);
      // You can emit a response back to the client
      socket.emit("message", { message: "Hello from server!" });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A client disconnected:", socket.id);
    });
  });
  server.io.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
  server.io.on("message", (message) => {
    console.log("Received message:", message);
  });
  console.log("Socket.IO is ready");
})

server.route(testRouter);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
