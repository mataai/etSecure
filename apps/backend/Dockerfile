FROM node:lts-alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

# Install only production dependencies
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000


# Crée un utilisateur sécurisé
RUN addgroup --system backend && \
    adduser --system -G backend backend

# Attribution des droits
RUN chown -R backend:backend .

USER backend

EXPOSE 3000

COPY ./dist/apps/backend .

CMD ["node", "main.js"]
