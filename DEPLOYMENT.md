# Guía de Despliegue — Vercel + Railway

## Arquitectura de Despliegue

El proyecto se despliega como **dos servicios separados**:

```
Vercel (Frontend)                    Railway (Backend)
├── React + Vite                     ├── Express + Node.js
├── CDN global                       ├── /api/* endpoints
├── Auto-deploy al hacer push        ├── In-memory storage
└── URL: https://taller01.vercel.app └── URL: https://backend.up.railway.app
```

El frontend llama al backend via `fetch()` usando la URL de Railway configurada en `VITE_API_URL`.

---

## 1. Desplegar el Backend en Railway

### Paso 1: Crear cuenta y proyecto

1. Ir a [railway.app](https://railway.app) y crear cuenta
2. New Project → Deploy from GitHub repo
3. Seleccionar el repositorio `taller01`

### Paso 2: Configurar el servicio

En el dashboard de Railway, configurar:

| Campo | Valor |
|---|---|
| **Name** | `backend` (o el que prefieras) |
| **Root Directory** | `backend` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |

> **Nota:** Railway detecta `Procfile` automáticamente. Si lo configuras, usa `web: node dist/index.js`.

### Paso 3: Variables de entorno

En el dashboard de Railway → Variables:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Railway lo inyecta automáticamente (no configurar) |

### Paso 4: Obtener la URL

Una vez desplegado, Railway asigna una URL pública. Copiarla (ej. `https://backend-taller01.up.railway.app`).

### Paso 5: Verificar

```bash
curl https://backend-taller01.up.railway.app/api/health
# → {"status":"ok","timestamp":"..."}

curl https://backend-taller01.up.railway.app/api/documents/doc-001
# → {"id":"doc-001","content":"...",...}
```

---

## 2. Desplegar el Frontend en Vercel

### Paso 1: Crear cuenta y proyecto

1. Ir a [vercel.com](https://vercel.com) y crear cuenta
2. New Project → Import GitHub repository
3. Seleccionar el repositorio `taller01`

### Paso 2: Configurar el proyecto

Vercel detecta automáticamente el `vercel.json`. Verificar la configuración:

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `pnpm install && pnpm build` |
| **Output Directory** | `dist` |

### Paso 3: Variables de entorno

En el dashboard de Vercel → Settings → Environment Variables:

| Variable | Valor | Entorno |
|---|---|---|
| `VITE_API_URL` | `https://backend-taller01.up.railway.app` | Production, Preview, Development |

> **Importante:** Reemplazar la URL con la URL real de tu backend en Railway.

### Paso 4: Desplegar

Vercel despliega automáticamente al hacer push a `main`. También genera una URL de preview para cada PR.

### Paso 5: Verificar

Abrir la URL de Vercel (ej. `https://taller01.vercel.app`) y:
1. Escribir en el editor → verificar que el backend responde
2. Cambiar entre modos → verificar que las métricas se actualizan

---

## 3. Variables de Entorno

### Vercel (Frontend)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL del backend en Railway | `https://backend.up.railway.app` |

### Railway (Backend)

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor (Railway lo inyecta) | No configurar |
| `NODE_ENV` | Modo de ejecución | `production` |

---

## 4. Desarrollo Local

El desarrollo local usa frontend y backend por separado con hot reload:

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

En desarrollo, el frontend necesita saber la URL del backend. Crear `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:3001
```

---

## 5. Auto-Deploy

### Vercel
- **Production:** push a `main` → deploy automático
- **Preview:** cada PR genera una URL de preview
- **Rollback:** dashboard → Deployments → promover uno anterior

### Railway
- **Production:** push a `main` → deploy automático
- **Logs:** dashboard → Logs en tiempo real
- **Metrics:** dashboard → Metrics (CPU, memoria, requests)

---

## 6. Solución de Problemas

| Problema | Causa | Solución |
|---|---|---|
| Frontend no carga datos | `VITE_API_URL` no está configurado | Agregar la variable en Vercel |
| CORS error en desarrollo | Backend no permite el origin del frontend | Verificar `allowedOrigins` en `index.ts` |
| Backend no responde | Railway está en cold start | Esperar 10-30 segundos |
| Build falla en Railway | pnpm no está instalado | Verificar que el Procfile existe |
