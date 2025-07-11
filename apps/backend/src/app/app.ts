import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { container } from 'tsyringe';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors'

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Place here your custom code!
  await fastify.register(cors, {
    // put your options here
    origin: '*', // Allow all origins, adjust as needed for security
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    credentials: true, // Allow credentials if needed
  });
  fastify.register(fastifyMultipart);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });

  container.register<FastifyInstance>('FastifyInstance', {
    useValue: fastify,
  });
}
