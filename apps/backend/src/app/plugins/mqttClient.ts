// plugins/mqttClient.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mqttClient: MqttClient;
  }
}

interface MqttClientPluginOptions {
  url: string;
  options?: IClientOptions;
}

const mqttClientPlugin: FastifyPluginAsync<MqttClientPluginOptions> = async (
  fastify,
  opts
) => {
  const { url, options = {} } = opts;

  if (!url) {
    throw new Error('[mqttClient] Missing MQTT broker URL.');
  }

  // Add extra options for username, password, and CA file if present
  const clientOptions: IClientOptions = {
    ...options,
    clientId: options.clientId || undefined,
    username: options.username || undefined,
    password: options.password || undefined,
    port: options.port || 1883, // Default to 1883 if not provided
    ca: options.ca || undefined,
  };

  // If CA file path is provided, load the certificate file
  if (options.ca && typeof options.ca === 'string') {
    try {
      clientOptions.ca = fs.readFileSync(path.resolve(options.ca));
    } catch (err) {
      fastify.log.error(`Failed to load CA file: ${err.message}`);
    }
  } else if (options.ca) {
    clientOptions.ca = options.ca;
  }

  const client = mqtt.connect(url, clientOptions);

  client.subscribe('doors/+/status');

  client.on('message', (topic, message) => {
    const msg = message.toString();

    if (topic.startsWith('doors/')) {
      const doorId = topic.split('/')[1];
      if (topic.endsWith('/status')) {
        fastify.log.info(`Door ${doorId} status update: ${msg}`);
        // store status in db
        fastify.mongo.db.collection('doors').updateOne(
          { _id: new ObjectId(doorId) },
          { $set: { status: msg } },
          { upsert: true }
        ).then(() => {
          fastify.log.info(`Updated door ${doorId} status to ${msg}`);
        }).catch(err => {
          fastify.log.error(`Failed to update door ${doorId} status: ${err.message}`);
        });
        return;
      }
    }
      fastify.log.warn(`Received message on unknown topic ${topic}: ${msg}`);
  });

  fastify.decorate('mqttClient', client);

  client.on('connect', () => {
    fastify.log.info(`✅ Connected to MQTT broker at ${url}`);
  });

  client.on('error', (err) => {
    fastify.log.error(`❌ MQTT error: ${err.message}`);
  });

  fastify.addHook('onClose', (instance, done) => {
    fastify.log.info('📴 Closing MQTT connection');
    client.end(true, done);
  });
};

export default fp<MqttClientPluginOptions>(mqttClientPlugin, {
  name: 'mqttClient',
});
