# Twitch Analytics API - Guía de Utilización

Esta guía explica detalladamente cómo configurar, ejecutar, probar e interactuar con los endpoints de la API de Twitch Analytics.

---

## Configuración Inicial

### Requisitos Previos
*   Node.js: Versión 16.x o superior.
*   npm (incluido con Node.js).

### 1. Instalación de Dependencias
Ejecuta el siguiente comando en la raíz del proyecto para instalar todos los paquetes necesarios:
```bash
npm install
```

### 2. Variables de Entorno (.env)
Crea un archivo llamado .env en la raíz del proyecto y añade tus credenciales de la consola de desarrolladores de Twitch:
```env
PORT=3000
TWITCH_CLIENT_ID=tu_twitch_client_id
TWITCH_CLIENT_SECRET=tu_twitch_client_secret
```

---

## Ejecución del Proyecto

### Modo Desarrollo
Para iniciar el servidor con recarga automática al guardar cambios en el código:
```bash
npm run dev
```
El servidor estará escuchando de forma predeterminada en http://localhost:3000.

### Modo Producción
Para compilar el código TypeScript a JavaScript nativo e iniciar el servidor en producción:
```bash
npm run build
npm start
```

### Ejecución con Docker
Para compilar y ejecutar la aplicación dentro de contenedores de Docker utilizando Docker Compose:

1. Asegúrate de tener el archivo `.env` configurado con tus credenciales de Twitch.
2. Inicia los contenedores con:
   ```bash
   docker compose up --build -d
   ```
3. El servidor estará escuchando en `http://localhost:3000` (o el puerto que hayas configurado en tu `.env`).
4. Los datos de la base de datos se guardarán de forma persistente en el directorio local `./data`.

Para detener los contenedores:
```bash
docker compose down
```

### Ejecutar Pruebas (Tests)
Para ejecutar la suite completa de pruebas unitarias e integración con Jest:
```bash
npm test
```

---

## Sistema de Autenticación

Los endpoints marcados como Premium requieren un token de sesión temporal válido enviado en la cabecera Authorization.

### Formato de la Cabecera
```http
Authorization: Bearer <token_de_sesión>
```

#### Flujo de Obtención de Credenciales:
1.  **Registro (POST /register):** Envía tu correo para recibir una API Key.
    *   Body (JSON): `{"email": "usuario@example.com"}`
    *   Response (200 OK): `{"api_key": "abcd1234efgh5678"}`
2.  **Obtención de Token (POST /token):** Genera un token de acceso temporal con validez de 3 días.
    *   Body (JSON): `{"email": "usuario@example.com", "api_key": "abcd1234efgh5678"}`
    *   Response (200 OK): `{"token": "generated_token"}`

*Nota: El backend procesa las solicitudes autenticadas mediante un middleware que valida los tokens directamente en la base de datos SQLite local.*

---

## Endpoints de la API

### 1. Consultar Información de un Streamer
Obtiene información detallada de un canal o creador de contenido mediante su ID único de Twitch.

*   **Método:** GET
*   **Ruta:** /analytics/streamer
*   **Query Params:**
    *   id (numérico, obligatorio): ID del streamer en Twitch.
*   **Ejemplo de Petición:**
    ```bash
    curl -X GET "http://localhost:3000/analytics/streamer?id=83232866"
    ```
*   **Respuestas:**
    *   **200 OK:**
        ```json
        {
          "id": "83232866",
          "login": "ibai",
          "display_name": "Ibai",
          "type": "",
          "broadcaster_type": "partner",
          "description": "Streamer de Twitch e influenciador...",
          "profile_image_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/...",
          "offline_image_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/...",
          "view_count": 0,
          "created_at": "2015-02-20T16:47:56Z"
        }
        ```
    *   **400 Bad Request (Parámetro inválido o ausente):**
        ```json
        { "error": "Invalid or missing 'id' parameter." }
        ```
    *   **401 Unauthorized (Token de acceso de Twitch inválido):**
        ```json
        { "error": "Unauthorized. Twitch access token is invalid or has expired." }
        ```
    *   **404 Not Found (Streamer no encontrado):**
        ```json
        { "error": "User not found." }
        ```

---

### 2. Consultar Streams en Vivo
Obtiene un listado simple de las emisiones en vivo que están activas actualmente en la plataforma.

*   **Método:** GET
*   **Ruta:** /analytics/streams
*   **Ejemplo de Petición:**
    ```bash
    curl -X GET "http://localhost:3000/analytics/streams"
    ```
*   **Respuestas:**
    *   **200 OK:**
        ```json
        [
          {
            "title": "TORNEO VALORANT CON LA COMUNIDAD",
            "user_name": "ValorantStreamer"
          },
          {
            "title": "Charlando de futbol y musica",
            "user_name": "ChattingHost"
          }
        ]
        ```
    *   **401 Unauthorized:**
        ```json
        { "error": "Unauthorized. Twitch access token is invalid or has expired." }
        ```

---

### 3. Top Streams Enriquecidos (Premium)
Obtiene una lista de streams en vivo ordenada por cantidad de espectadores, enriquecida con información del canal del streamer (nombre y foto de perfil).

*   **Método:** GET
*   **Ruta:** /analytics/streams/enriched
*   **Autenticación requerida:** Sí (Bearer Token)
*   **Query Params:**
    *   limit (entero, obligatorio): Número máximo de elementos a devolver.
*   **Ejemplo de Petición:**
    ```bash
    curl -X GET "http://localhost:3000/analytics/streams/enriched?limit=3" \
         -H "Authorization: Bearer generated_token"
    ```
*   **Respuestas:**
    *   **200 OK:**
        ```json
        [
          {
            "stream_id": "987654321",
            "user_id": "111111111",
            "user_name": "TopStreamer1",
            "viewer_count": 34567,
            "title": "Epic Gaming Session",
            "user_display_name": "TopStreamer1",
            "profile_image_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/topstreamer1-profile_image.png"
          }
        ]
        ```
    *   **400 Bad Request (Límite no especificado o inválido):**
        ```json
        { "error": "Invalid 'limit' parameter." }
        ```
    *   **401 Unauthorized (Token inválido o expirado):**
        ```json
        { "error": "Unauthorized. Token is invalid or expired." }
        ```

---

### 4. Top of the Tops (Premium + Cache)
Obtiene métricas sobre los 40 videos más visualizados de cada uno de los tres juegos más populares de Twitch.

*   **Método:** GET
*   **Ruta:** /analytics/topsofthetops
*   **Autenticación requerida:** Sí (Bearer Token)
*   **Query Params:**
    *   since (entero, opcional): Tiempo máximo en segundos para forzar la actualización de la caché (por defecto, utiliza una caché de 10 minutos guardada en la base de datos SQLite).
*   **Ejemplo de Petición:**
    ```bash
    curl -X GET "http://localhost:3000/analytics/topsofthetops?since=600" \
         -H "Authorization: Bearer generated_token"
    ```
*   **Respuestas:**
    *   **200 OK:**
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
    *   **400 Bad Request (Parámetro since inválido):**
        ```json
        { "error": "Bad Request. Invalid or missing parameters." }
        ```
    *   **401 Unauthorized:**
        ```json
        { "error": "Unauthorized. Token is invalid or expired." }
        ```
    *   **404 Not Found (Caché vacía o datos no encontrados):**
        ```json
        { "error": "Not Found. No data available." }
        ```
