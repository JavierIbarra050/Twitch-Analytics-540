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

# sqlite3 descarga un binario nativo precompilado que puede no ser compatible
# con la glibc de esta imagen base; se compila desde el propio toolchain del
# contenedor para garantizar que funciona en runtime.
ENV npm_config_build_from_source=true
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    npm ci --only=production && \
    apt-get purge -y --auto-remove python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

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
