// src/plugins/mongoConnector.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { MongoClient, Db } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: {
      client: MongoClient;
      db: Db;
    };
  }
}

const mongoConnector: FastifyPluginAsync = fp(async (fastify, opts) => {
  const url = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB;

  if (!url || !dbName) {
    fastify.log.error('Missing MONGO_URL or MONGO_DB in environment');
    process.exit(1);
  }

  const client = new MongoClient(url);
  await client.connect();

  fastify.log.info('MongoDB connected');

  fastify.decorate('mongo', {
    client,
    db: client.db(dbName),
  });

  fastify.addHook('onClose', async () => {
    await client.close();
  });
});

export default mongoConnector;
