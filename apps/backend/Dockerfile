FROM node:lts-alpine AS build

WORKDIR /app

COPY dist/apps/backend .
COPY package.json package-lock.json ./

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

CMD ["node", "main.js"]
