# Guía de Despliegue — Vercel + Render

## Arquitectura de Despliegue

```
Vercel (Frontend)                     Render (Backend)
├── React + Vite                      ├── Express + Node.js (Docker)
├── CDN global                        ├── /api/* endpoints
├── Auto-deploy al hacer push         ├── In-memory storage
└── URL: https://taller01.vercel.app  └── URL: https://editor-colaborativo.onrender.com
```

El frontend llama al backend via `fetch()` usando la URL de Render configurada en `VITE_API_URL`.

---

## 1. Desplegar el Backend en Render

### Paso 1: Crear cuenta y servicio

1. Ir a [render.com](https://render.com) y crear cuenta
2. New → Web Service → Connect a GitHub repository
3. Seleccionar el repositorio `taller01`

### Paso 2: Configurar el servicio

Render detecta el `render.yaml` automáticamente. Si no lo hace, configurar manualmente:

| Campo | Valor |
|---|---|
| **Name** | `editor-colaborativo-backend` |
| **Runtime** | Docker |
| **Dockerfile** | `./backend/Dockerfile` |
| **Docker Context** | `.` |
| **Port** | `8080` |

### Paso 3: Variables de entorno

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Render lo inyecta automáticamente (no configurar) |

### Paso 4: Verificar

```bash
curl https://editor-colaborativo.onrender.com/api/health
# → {"status":"ok","timestamp":"..."}

curl https://editor-colaborativo.onrender.com/api/documents/doc-001
# → {"id":"doc-001","content":"...",...}
```

> **Nota:** El primer request puede tardar 30-60 segundos (cold start con plan gratuito).

---

## 2. Desplegar el Frontend en Vercel

### Paso 1: Crear cuenta y proyecto

1. Ir a [vercel.com](https://vercel.com) y crear cuenta
2. New Project → Import GitHub repository
3. Seleccionar el repositorio `taller01`

### Paso 2: Configurar el proyecto

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `pnpm install && pnpm build` |
| **Output Directory** | `dist` |

### Paso 3: Variables de entorno

En Vercel → Settings → Environment Variables:

| Variable | Valor | Entorno |
|---|---|---|
| `VITE_API_URL` | `https://editor-colaborativo.onrender.com` | Production, Preview, Development |

> **Importante:** Reemplazar con la URL real de tu backend en Render.

### Paso 4: Verificar

Abrir la URL de Vercel y:
1. Escribir en el editor → verificar que el backend responde
2. Cambiar entre modos → verificar que las métricas se actualizan

---

## 3. Variables de Entorno

### Vercel (Frontend)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL del backend en Render | `https://editor-colaborativo.onrender.com` |

### Render (Backend)

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor (Render lo inyecta) | `8080` |
| `NODE_ENV` | Modo de ejecución | `production` |

---

## 4. Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Ejecutar ambos en paralelo
pnpm dev
# Frontend: http://localhost:5173 (Vite dev server)
# Backend:  http://localhost:3001 (tsx watch)
```

En desarrollo, crear `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:3001
```

---

## 5. Auto-Deploy

### Vercel
- **Production:** push a `main` → deploy automático
- **Preview:** cada PR genera una URL de preview

### Render
- **Production:** push a `main` → rebuild automático
- **Logs:** dashboard → Logs en tiempo real

---

## 6. Solución de Problemas

| Problema | Causa | Solución |
|---|---|---|
| Frontend no carga datos | `VITE_API_URL` no configurado | Agregar la variable en Vercel |
| Backend tarda en responder | Cold start en Render | Esperar 30-60s o upgrade a plan pago |
| CORS error | Backend no permite el origin | Verificar `allowedOrigins` en `index.ts` |
| Build falla en Render | Versión de pnpm incompatible | El Dockerfile usa `pnpm@11.22.0` fija |
