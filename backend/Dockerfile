# ─── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm via Corepack (versión fija para compatibilidad con lockfile)
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

# Copiar archivos de workspace primero (aprovecha cache de Docker)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente del backend
COPY backend/ backend/

# Build del backend (tsc → backend/dist/)
RUN pnpm --filter backend build

# ─── Stage 2: Producción ────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./

# Instalar SOLO dependencias de producción (cors, express)
RUN npm install --omit=dev --ignore-scripts

# Render inyecta PORT dinámicamente; fallback a 8080
ENV PORT=8080
EXPOSE 8080

# Ejecutar como usuario no-root por seguridad
USER node

CMD ["node", "dist/index.js"]
