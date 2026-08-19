# ─── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de workspace y dependencias primero (aprovecha cache de Docker)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Instalar todas las dependencias (incluye devDependencies para build)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY frontend/ frontend/
COPY backend/ backend/

# Build del frontend (tsc -b && vite build → frontend/dist/)
RUN pnpm --filter frontend build

# Build del backend (tsc → backend/dist/)
RUN pnpm --filter backend build

# Copiar el build del frontend a la carpeta pública del backend
# Express servirá estos archivos como estáticos
RUN cp -r frontend/dist backend/public

# ─── Stage 2: Producción ────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/public ./public
COPY --from=builder /app/backend/package.json ./

# Instalar SOLO dependencias de producción (cors, express, ws)
RUN npm install --omit=dev --ignore-scripts

# Render inyecta PORT dinámicamente; fallback a 8080
ENV PORT=8080
EXPOSE 8080

# Ejecutar como usuario no-root por seguridad
USER node

CMD ["node", "dist/index.js"]
