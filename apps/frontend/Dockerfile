FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Supprime les fichiers statiques par défaut de nginx
RUN rm -rf ./*

# Copy custom Nginx config
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Copie le build du frontend depuis l'étape de build
COPY ./dist/apps/frontend/browser/ .

EXPOSE 80


# Start Nginx directly with custom config
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
