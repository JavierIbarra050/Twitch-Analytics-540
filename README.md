# Twitch Analytics API

API REST en Node.js y TypeScript que expone datos de Twitch (streamers, streams en vivo y estadísticas agregadas de los juegos más vistos) a través de un sistema propio de registro y autenticación. El servidor actúa como intermediario entre el cliente y la API oficial de Twitch: gestiona el token de aplicación de Twitch internamente, cachea resultados costosos en base de datos y expone endpoints propios protegidos con un token de sesión.

---

## Índice

1. [Qué hace el proyecto](#qué-hace-el-proyecto)
2. [Stack técnico](#stack-técnico)
3. [Arquitectura](#arquitectura)
4. [Estructura de carpetas](#estructura-de-carpetas)
5. [Configuración inicial](#configuración-inicial)
6. [Ejecución del proyecto](#ejecución-del-proyecto)
7. [Base de datos](#base-de-datos)
8. [Sistema de autenticación](#sistema-de-autenticación)
9. [Endpoints de la API](#endpoints-de-la-api)
10. [Tests](#tests)
11. [Entorno de producción](#entorno-de-producción)

---

## Qué hace el proyecto

El proyecto resuelve un problema concreto: la API pública de Twitch (Helix) exige gestionar un token de aplicación (client credentials), combinar varias llamadas para enriquecer datos, y no ofrece agregados como "los streams más vistos por juego". Esta API hace ese trabajo una sola vez en el servidor y lo expone de forma simplificada:

- Consulta de información de un streamer por su ID de Twitch.
- Listado de streams en vivo en la plataforma.
- Listado de streams en vivo enriquecido con datos del canal (foto de perfil, nombre para mostrar) y ordenado por espectadores.
- Ranking agregado de los vídeos más vistos de los tres juegos más populares del momento, con resultados cacheados en base de datos para no golpear la API de Twitch en cada petición.

Para usar la API hay que registrarse con un email (se obtiene una API key) y luego canjear esa API key por un token de sesión temporal, que es el que se usa en el resto de peticiones.

## Stack técnico

- **Node.js** + **TypeScript**, ejecutado con `ts-node-dev` en desarrollo y compilado con `tsc` para producción.
- **Express 5** como framework HTTP.
- **axios** para las llamadas a la API de Twitch.
- **mysql2** y **sqlite3/sqlite** como drivers de base de datos, seleccionados automáticamente según la configuración (ver [Base de datos](#base-de-datos)).
- **Jest** + **ts-jest** + **supertest** para tests unitarios, de integración y end-to-end.
- **Docker** / **docker compose** para empaquetar y desplegar la aplicación.

## Arquitectura

El código sigue un enfoque por dominios inspirado en Domain-Driven Design, con cada funcionalidad de negocio organizada como un módulo independiente bajo `src/`. Cada módulo repite la misma división en tres capas:

- **Domain**: entidades, value objects, interfaces de repositorio y errores propios del dominio. No depende de Express, de axios ni de ninguna librería externa.
- **Application**: casos de uso (services) que orquestan el dominio. Reciben sus dependencias por constructor (inyección manual), lo que permite testearlos sustituyendo los repositorios por dobles de test.
- **Infrastructure**: todo lo que conecta el dominio con el mundo exterior — controladores Express, repositorios concretos que llaman a la API de Twitch o a la base de datos, rutas y middlewares.

Los módulos de negocio son: `User` (registro y tokens), `Streamer`, `Stream` y `TopOfTheTops`. `Stream` cubre tanto el listado simple de streams en vivo como su variante enriquecida con datos de perfil: no son dos contextos de negocio distintos, son dos niveles de detalle sobre el mismo dato, así que comparten repositorio (`IStreamRepository`) y servicio de aplicación (`StreamService`), y solo se separan en la capa de Infrastructure (`StreamController` y `EnrichedStreamController`), porque cada endpoint tiene su propio contrato HTTP. `EnrichedStream` no extiende de `Stream` (no hay herencia): tiene un `Stream` como campo interno y delega en él para `title`/`userName`, en lugar de duplicar esos dos datos como campos propios. Además existe un módulo `Shared` con la configuración, la conexión a base de datos, el cliente HTTP de Twitch y el middleware de autenticación, usados de forma transversal por el resto de módulos.

No se usa ningún framework de inyección de dependencias: `src/Shared/Infrastructure/container.ts` construye a mano todas las instancias (repositorios, servicios, controladores) y las expone como constantes. Las rutas importan esas instancias ya construidas en lugar de crearlas ellas mismas. Esto hace explícito el grafo de dependencias del proyecto con solo leer un archivo.

El punto de entrada (`src/index.ts`) inicializa la base de datos (crea las tablas si no existen) y, solo si eso tiene éxito, levanta el servidor Express definido en `src/app.ts`.

## Estructura de carpetas

```
src/
  app.ts                    Configuración de Express: middlewares globales, montaje de rutas, 404 y manejador de errores
  index.ts                  Punto de entrada: inicializa la base de datos y arranca el servidor

  Shared/Infrastructure/
    Config/config.ts        Lectura y validación de variables de entorno
    Database/database.ts    Adaptador de base de datos (SQLite / MySQL) y creación de tablas
    Twitch/                 Cliente HTTP hacia la API de Twitch y manejo del token de aplicación
    Middlewares/            Middleware de autenticación por Bearer token
    container.ts            Construcción manual de todas las dependencias de la aplicación

  User/                     Registro de usuarios, generación de API keys y de tokens de sesión
  Streamer/                 Consulta de información de un streamer concreto
  Stream/                   Streams en vivo: listado simple y variante enriquecida con datos de perfil, ordenados por audiencia
  TopOfTheTops/             Ranking agregado de los vídeos más vistos por juego, con cache en base de datos

test/                       Tests organizados en la misma estructura que src/, más un directorio e2e/
data/                       Directorio persistente para el fichero de base de datos SQLite en local/Docker
postman/                    Colección de Postman con pruebas para todos los endpoints
```

## Configuración inicial

### Requisitos previos

- Node.js 16 o superior.
- npm (se instala junto con Node.js).
- Una aplicación registrada en la [consola de desarrolladores de Twitch](https://dev.twitch.tv/console) para obtener `TWITCH_CLIENT_ID` y `TWITCH_CLIENT_SECRET`.

### Instalación de dependencias

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Las variables relacionadas con Twitch son obligatorias; el resto tienen valores por defecto sensatos para desarrollo local.

```env
# Obligatorias
TWITCH_CLIENT_ID=tu_twitch_client_id
TWITCH_CLIENT_SECRET=tu_twitch_client_secret

# Opcionales
PORT=3000                      # Puerto donde escucha el servidor (por defecto 3000)
TOKEN_EXPIRATION_DAYS=3        # Días de validez del token de sesión (por defecto 3)
DATABASE_PATH=./database.sqlite # Ruta del fichero SQLite si no se usa MySQL

# Solo si se quiere usar MySQL en lugar de SQLite (ver sección Base de datos)
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Si no se define `DB_HOST`, la aplicación usa SQLite de forma automática y no hace falta configurar nada más.

## Ejecución del proyecto

### Modo desarrollo

Arranca el servidor con recarga automática al guardar cambios en el código:

```bash
npm run dev
```

El servidor queda escuchando en `http://localhost:3000` (o en el puerto indicado por `PORT`).

### Modo producción

Compila TypeScript a JavaScript y ejecuta el resultado:

```bash
npm run build
npm start
```

### Con Docker

1. Asegúrate de tener el `.env` configurado en la raíz del proyecto.
2. Compila la imagen y levanta el contenedor en segundo plano:
   ```bash
   docker compose up --build -d
   ```
3. Comprueba el estado del contenedor:
   ```bash
   docker compose ps
   ```
4. Consulta los logs en tiempo real:
   ```bash
   docker compose logs -f
   ```
5. La API queda accesible en `http://localhost:3000` (o el puerto configurado en `PORT`).
6. Si se usa SQLite, el fichero de base de datos se guarda en el directorio `./data`, montado como volumen para que los datos sobrevivan a reinicios del contenedor.

Para detener y eliminar el contenedor:

```bash
docker compose down
```

## Base de datos

El proyecto soporta dos motores de base de datos a través de un mismo adaptador (`IDatabase`), definido en `src/Shared/Infrastructure/Database/database.ts`:

- **SQLite**, usado por defecto cuando no hay variables `DB_*` configuradas. Es la opción pensada para desarrollo local y para el despliegue con Docker Compose sin dependencias externas.
- **MySQL**, usado automáticamente en cuanto se define `DB_HOST` en el entorno. Pensado para el despliegue en producción contra una base de datos gestionada.

La elección del motor ocurre una única vez, al resolver la primera conexión (`DatabaseConnection`, patrón singleton), por lo que toda la aplicación comparte el mismo adaptador durante su ciclo de vida. Al arrancar, `initializeDatabase()` crea (si no existen) las tablas necesarias con la sintaxis correspondiente al motor activo:

- `users`: email y API key de cada usuario registrado.
- `user_tokens`: tokens de sesión emitidos, con su fecha de expiración.
- `game_cache`: cache de los resultados del endpoint `topsofthetops`, para evitar recalcularlos en cada petición.

## Sistema de autenticación

Todos los endpoints bajo `/analytics` requieren un token de sesión enviado en la cabecera `Authorization`.

```http
Authorization: Bearer <token_de_sesión>
```

El flujo para obtener credenciales es en dos pasos:

1. **Registro** — `POST /register` con el email. Devuelve una `api_key` asociada a ese email (si el email ya existía, se genera una nueva API key para él).
2. **Generación de token** — `POST /token` con el email y la `api_key` obtenida en el paso anterior. Devuelve un token de sesión válido durante `TOKEN_EXPIRATION_DAYS` días (3 por defecto).

El token se valida en cada petición contra la base de datos a través de `AuthMiddleware`, comprobando que existe y que no ha superado su fecha de expiración.

### Rate limiting

La API implementa dos límites de peticiones (vía `express-rate-limit`) para proteger la cuota compartida de la API de Twitch frente a abusos:

- **`POST /register` y `POST /token`** — 20 peticiones cada 15 minutos, por IP. Son rutas sin autenticación y las más expuestas a abuso.
- **`/analytics/*`** — 100 peticiones por minuto, por token de sesión (no por IP), ya que estas rutas requieren autenticación.

Al superar el límite, la API responde `429 Too Many Requests` con `{ "error": "Too many requests. Please try again later." }`. Los valores están definidos como constantes en `src/Shared/Infrastructure/Middlewares/RateLimiter.ts`.

## Endpoints de la API

### POST /register

Registra un email y devuelve su API key.

- **Autenticación:** no requiere.
- **Body:** `{ "email": "usuario@example.com" }`
- **200 OK:** `{ "api_key": "abcd1234efgh5678" }`
- **400 Bad Request:** email ausente o con formato inválido, por ejemplo `{ "error": "The email is mandatory" }`.

### POST /token

Canjea una API key por un token de sesión.

- **Autenticación:** no requiere.
- **Body:** `{ "email": "usuario@example.com", "api_key": "abcd1234efgh5678" }`
- **200 OK:** `{ "token": "generated_token" }`
- **400 Bad Request:** falta el email o la `api_key`.
- **401 Unauthorized:** la combinación de email y API key no es válida.

### GET /analytics/streamer

Información detallada de un canal de Twitch por su ID.

- **Autenticación:** Bearer token.
- **Query params:** `id` (numérico, obligatorio).
- **Ejemplo:**
  ```bash
  curl "http://localhost:3000/analytics/streamer?id=141981764" \
       -H "Authorization: Bearer <token>"
  ```
- **200 OK:**
  ```json
  {
    "id": "141981764",
    "login": "twitchdev",
    "display_name": "TwitchDev",
    "type": "",
    "broadcaster_type": "partner",
    "description": "...",
    "profile_image_url": "https://static-cdn.jtvnw.net/...",
    "offline_image_url": "https://static-cdn.jtvnw.net/...",
    "view_count": 0,
    "created_at": "2016-12-14T20:32:28.000Z"
  }
  ```
- **400 Bad Request:** `id` ausente o no numérico.
- **401 Unauthorized:** token de sesión inválido o token de aplicación de Twitch inválido.
- **404 Not Found:** no existe ningún streamer con ese ID.

### GET /analytics/streams

Listado simple de streams en vivo en Twitch en este momento.

- **Autenticación:** Bearer token.
- **Ejemplo:**
  ```bash
  curl "http://localhost:3000/analytics/streams" \
       -H "Authorization: Bearer <token>"
  ```
- **200 OK:**
  ```json
  [
    { "title": "TORNEO VALORANT CON LA COMUNIDAD", "user_name": "ValorantStreamer" },
    { "title": "Charlando de futbol y musica", "user_name": "ChattingHost" }
  ]
  ```
- **401 Unauthorized:** token de sesión inválido o token de Twitch inválido.

### GET /analytics/streams/enriched

Streams en vivo ordenados por número de espectadores, enriquecidos con datos del canal (nombre para mostrar y foto de perfil).

- **Autenticación:** Bearer token.
- **Query params:** `limit` (entero positivo, obligatorio) — número máximo de resultados.
- **Ejemplo:**
  ```bash
  curl "http://localhost:3000/analytics/streams/enriched?limit=5" \
       -H "Authorization: Bearer <token>"
  ```
- **200 OK:**
  ```json
  [
    {
      "stream_id": "987654321",
      "user_id": "111111111",
      "user_name": "TopStreamer1",
      "viewer_count": 34567,
      "title": "Epic Gaming Session",
      "user_display_name": "TopStreamer1",
      "profile_image_url": "https://static-cdn.jtvnw.net/..."
    }
  ]
  ```
- **400 Bad Request:** `limit` ausente, no numérico o menor o igual que cero.
- **401 Unauthorized:** token de sesión inválido o token de Twitch inválido.

### GET /analytics/topsofthetops

Métricas agregadas sobre los vídeos más vistos de los tres juegos más populares de Twitch en este momento. El resultado se cachea en base de datos para no recalcularlo en cada petición.

- **Autenticación:** Bearer token.
- **Ejemplo:**
  ```bash
  curl "http://localhost:3000/analytics/topsofthetops" \
       -H "Authorization: Bearer <token>"
  ```
- **200 OK:**
  ```json
  [
    {
      "game_id": "509658",
      "game_name": "Just Chatting",
      "user_name": "LCK",
      "total_videos": "4",
      "total_views": "1000000000",
      "most_viewed_title": "DK vs T1 | 2021 LCK Summer FINALS",
      "most_viewed_views": "5550000",
      "most_viewed_duration": "5h52m8s",
      "most_viewed_created_at": "2015-02-20T16:47:56Z"
    }
  ]
  ```
- **401 Unauthorized:** token de sesión inválido.

## Tests

La suite cubre entidades de dominio, value objects, servicios de aplicación, controladores y repositorios de cada módulo, además de un test end-to-end (`test/e2e/analytics.e2e.test.ts`) que ejercita la aplicación completa con supertest.

```bash
npm test
```

## Entorno de producción

La API está desplegada en alwaysdata, conectada a una base de datos MySQL en la nube.

- **URL base:** `https://javieribarra540.alwaysdata.net`

El uso en producción es idéntico al uso en local: primero `/register`, después `/token`, y con ese token se consultan los endpoints bajo `/analytics`, sustituyendo `http://localhost:3000` por la URL de producción.
