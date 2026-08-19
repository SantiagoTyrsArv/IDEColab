# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json frontend/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY frontend/ frontend/

# Build
RUN pnpm --filter frontend build

# ---- Production Stage ----
FROM nginx:alpine

# Copiar build del frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Configurar Nginx para SPA (todas las rutas → index.html)
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
