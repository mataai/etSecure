# --- Build stage ---
FROM node:lts-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --workspace=backend --configuration production

# --- Production stage ---
FROM node:lts-alpine AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app
RUN addgroup --system backend && \
    adduser --system -G backend backend

# Copy only built files and production dependencies
COPY --from=build /app/dist/apps/backend /app/package.json /app/package-lock.json ./backend/
RUN chown -R backend:backend .

USER backend

WORKDIR /app/backend
RUN npm ci --omit=dev

EXPOSE 3000
CMD [ "node", "main.js" ]
