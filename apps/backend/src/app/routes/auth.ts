import { OAuth2Namespace } from '@fastify/oauth2';
import { FastifyInstance } from 'fastify';
import fs from 'fs';

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

  fastify.post('/auth/picture', async function (req, res) {
    const token: string = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    let userInfo;

    try {
      userInfo = await fastify.customOauth2.userinfo(token);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        return res.status(401).send({ error: 'Unauthorized' });
      } else {
        console.error('Error fetching user info:', err);
        return res.status(500).send({ error: 'Internal Server Error' });
      }
    }

    const data =  await req.file();

    if (!data) {
      console.log(req);
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const file =  data.file;

    if (!file) {
      return res.status(400).send({ error: 'File upload failed' });
    }

    const savePath = `./uploads/${userInfo.sub}.jpg`;
    const writeStream = fs.createWriteStream(savePath);
    
    await file.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error('Error writing file:', err);
      return res.status(500).send({ error: 'Failed to save file' });
    });

    return res.status(200).send({
      message: 'File uploaded successfully'});
  });
}
