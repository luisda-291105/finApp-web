# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Desarrollo (Vite dev server con hot-reload)
# Uso: docker compose --profile dev up finapp-web-dev
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

# Instalar dependencias primero (mejor cache)
COPY package*.json ./
RUN npm ci

# El código fuente se monta como volumen en runtime (ver docker-compose)
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Builder (compila assets para producción)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL se inyecta en build time como ARG → ENV
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Producción (Nginx Alpine ligero)
# Uso: docker compose --profile prod up finapp-web-prod
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod

# Copiar configuración de Nginx personalizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar assets compilados desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
