import 'reflect-metadata';
import Fastify from 'fastify';
import { app } from './app/app';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

const mqttOptions = {
  url: 'mqtts://cloud-ind520',
  options: {
    clientId: process.env.MQTT_CLIENT_ID || 'server121212',
    username: process.env.MQTT_USERNAME || 'client',
    password: process.env.MQTT_PASSWORD || 'REDACTED',
    ca: process.env.MQTT_CA || './server.crt',
    port: process.env.MQTT_PORT || 8883,
  },
};

// Register your application as a normal plugin.
server.register(app, mqttOptions);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
