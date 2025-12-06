# ----- Etapa 1: Build (Construcción) -----
# Usamos una imagen de Node para construir la app
FROM node:18-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Recibimos argumentos de construcción (build args)
ARG VITE_GOOGLE_API_KEY
ARG VITE_BACKEND_URL

# Establecemos variables de entorno para que Vite las vea durante el build
ENV VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Ejecutamos el build de Vite para producción
RUN npm run build

# ----- Etapa 2: Serve (Servidor) -----
# Usamos una imagen ligera de Nginx para servir los archivos
FROM nginx:1.25-alpine

# Copiamos los archivos estáticos construidos en la Etapa 1
# (Vite guarda el build en la carpeta 'dist')
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración de reverse proxy de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (puerto por defecto de Nginx)
EXPOSE 80

# El comando por defecto de Nginx ya sirve el contenido
CMD ["nginx", "-g", "daemon off;"]