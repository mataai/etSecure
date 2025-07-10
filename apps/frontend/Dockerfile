FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Supprime les fichiers statiques par défaut de nginx
RUN rm -rf ./*

# Copie le build du frontend depuis l'étape de build
COPY dist/apps/frontend/browser .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
