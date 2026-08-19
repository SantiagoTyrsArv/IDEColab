# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json backend/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY backend/ backend/

# Build
RUN pnpm --filter backend build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Copiar built files
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/index.js"]
