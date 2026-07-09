# Guía de Despliegue en la Nube

Para desplegar esta API en proveedores de nube pública como Render, Railway o Fly.io, sigue estas instrucciones:

## Requisitos de Configuración en el Proveedor de Hosting

### 1. Conexión del Repositorio
- Conecta este repositorio de GitHub en tu panel de control de Render, Railway o Fly.io.

### 2. Comandos de Construcción y Arranque
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Variables de Entorno
Configura las siguientes variables de entorno en la sección "Environment Variables" de tu servicio:

- `PORT`: Puerto donde escuchará la aplicación (por ejemplo, `3000` o asignado dinámicamente por la plataforma).
- `TWITCH_CLIENT_ID`: Tu Twitch Client ID obtenido de la consola de desarrolladores de Twitch.
- `TWITCH_CLIENT_SECRET`: Tu Twitch Client Secret obtenido de la consola de desarrolladores de Twitch.

---
El servidor iniciará automáticamente la base de datos SQLite y creará las tablas necesarias en el arranque de producción.
