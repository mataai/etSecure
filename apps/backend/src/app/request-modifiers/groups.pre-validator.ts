import { preValidationMetaHookHandler } from 'fastify/types/hooks';

export const groupPreValidator = (
  authorizedGroups: string[] = []
): preValidationMetaHookHandler => {
  return (req, res, done) => {
    // Check if the user is authenticated
    if (!req.user) {
      res.status(401).send({ error: 'Unauthorized' });
      return done(new Error('Unauthorized'));
    }

    // Check if the user has the required permissions for group operations
    if (
      !req.user.groups.some((group: string) => authorizedGroups.includes(group))
    ) {
      res.status(403).send({ error: 'Forbidden' });
      return done(new Error('Forbidden'));
    }

    done();
  };
};
