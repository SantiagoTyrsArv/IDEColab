# Guía de Despliegue — Render

## Arquitectura de Despliegue

El proyecto se despliega como **un solo servicio Docker** en Render. El backend Express sirve tanto la API como los archivos estáticos del frontend (build de React/Vite). No hay servicios separados.

```
Render Web Service
├── Express (API + estáticos)
│   ├── /api/*          → Rutas de API (documents, sync, health)
│   ├── /*.js, *.css    → Archivos estáticos del frontend
│   └── /* (catch-all)  → index.html (SPA routing de React)
```

## Despliegue Automático (Recomendado)

### 1. Conectar el repositorio

1. Crear cuenta en [render.com](https://render.com)
2. New → Web Service → Connect a GitHub repository
3. Seleccionar el repositorio `taller01`

### 2. Configurar el servicio

Render detectará el `render.yaml` automáticamente. Si no lo hace, configurar manualmente:

| Campo | Valor |
|---|---|
| **Name** | `editor-colaborativo` |
| **Runtime** | Docker |
| **Dockerfile** | `./Dockerfile` |
| **Docker Context** | `.` |
| **Port** | `8080` |

### 3. Variables de entorno

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |

> **Nota:** `PORT` no necesita configurarse — Render lo inyecta automáticamente.

### 4. Health Check

Configurar el health check path a `/api/health`. Render verificará que el servicio esté saludable antes de dirigir tráfico.

### 5. Deploy

Render construye y despliega automáticamente al hacer push a la rama `main`.

## Despliegue Manual (Docker local)

### Probar el build de producción localmente

```bash
# Construir la imagen
docker build -t editor-colaborativo .

# Ejecutar (Render inyecta PORT; localmente lo mapeamos)
docker run -p 8080:8080 -e NODE_ENV=production editor-colaborativo

# Abrir http://localhost:8080
```

### Verificar que funciona

```bash
# Health check
curl http://localhost:8080/api/health
# → {"status":"ok","timestamp":"..."}

# API
curl http://localhost:8080/api/documents/doc-001
# → {"id":"doc-001","content":"...",...}

# Frontend (debe devolver index.html)
curl http://localhost:8080
# → <!doctype html>...

# SPA routing (cualquier ruta devuelve index.html)
curl http://localhost:8080/cualquier-ruta
# → <!doctype html>...
```

## Desarrollo Local (sin Docker)

El desarrollo local sigue usando frontend y backend por separado con hot reload:

```bash
# Instalar dependencias
pnpm install

# Ejecutar ambos en paralelo
pnpm dev
# Frontend: http://localhost:5173 (Vite dev server)
# Backend:  http://localhost:3001 (tsx watch)

# O por separado:
pnpm dev:frontend
pnpm dev:backend
```

En desarrollo, el frontend (`localhost:5173`) llama al backend (`localhost:3001`) via CORS. La variable `VITE_API_URL` no necesita configurarse porque el default en `constants.ts` es `''` (relativo), pero en desarrollo con servicios separados, configurar:

```bash
# En frontend/.env.local
VITE_API_URL=http://localhost:3001
```

## Variables de Entorno

| Variable | Entorno | Descripción | Default |
|---|---|---|---|
| `PORT` | Runtime | Puerto del servidor (Render lo inyecta) | `8080` |
| `NODE_ENV` | Build/Run | Modo de ejecución | `development` |
| `VITE_API_URL` | Build time (frontend) | URL base del backend para API calls | `''` (relativo) |

## Estructura del Dockerfile

```
Dockerfile (raíz)
├── Stage 1: builder
│   ├── node:20-alpine
│   ├── corepack enable (pnpm)
│   ├── pnpm install --frozen-lockfile
│   ├── pnpm --filter frontend build
│   ├── pnpm --filter backend build
│   └── cp -r frontend/dist backend/public
└── Stage 2: producción
    ├── node:20-alpine (imagen liviana)
    ├── backend/dist + backend/public
    ├── npm install --omit=dev
    ├── USER node (no-root)
    └── CMD node dist/index.js
```

## Archivos Legacy

Los Dockerfiles individuales y el pipeline de Cloud Build (GCP) se movieron a `docker/legacy/` para referencia. Ya no se usan para el despliegue actual.
