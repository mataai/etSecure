# --- Build stage ---
FROM node:lts-alpine AS build

WORKDIR /app

# On copie les fichiers nécessaires au runtime (build + deps)
COPY dist/apps/backend ./backend
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# --- Production stage ---
FROM node:lts-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Crée un utilisateur sécurisé
RUN addgroup --system backend && \
    adduser --system -G backend backend

WORKDIR /app

# Copie des fichiers de l'étape build
COPY --from=build /app/backend ./backend
COPY --from=build /app/package.json /app/package-lock.json ./

# Attribution des droits
RUN chown -R backend:backend .

USER backend

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "main.js"]
