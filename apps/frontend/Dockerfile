FROM node:20 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --workspace=frontend --configuration production

# --- Production image ---
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend from build stage
COPY --from=build /app/dist/apps/frontend .

# Optionally copy custom nginx config (uncomment if you have one)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
