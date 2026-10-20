# Imagen de la API de PorraRun. Se construye desde la raíz del repo:
#   docker compose build api
# Etapa 1: instala solo lo que necesita la API y la empaqueta en un único archivo.
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/mobile/package.json apps/mobile/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace @porras/api --workspace @porras/shared --ignore-scripts --no-audit --no-fund
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @porras/api

# Etapa 2: imagen final mínima, sin node_modules ni código fuente.
FROM node:24-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /repo/apps/api/dist/index.cjs ./index.cjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1
CMD ["node", "index.cjs"]
