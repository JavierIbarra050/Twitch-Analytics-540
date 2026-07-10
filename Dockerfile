# --- Stage 1: Build ---
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

# --- Stage 2: Run ---
FROM node:20-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# Instala solo dependencias de producción
RUN npm ci --only=production

# Copia el código compilado
COPY --from=builder /usr/src/app/dist ./dist

# Crea un directorio para la persistencia de la BD sqlite y asigna el propietario al usuario node
RUN mkdir -p data && chown -R node:node data

USER node

# Exponer el puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV PORT=3000
ENV DATABASE_PATH=/usr/src/app/data/database.sqlite

CMD ["node", "dist/index.js"]
