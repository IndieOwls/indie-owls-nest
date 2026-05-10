# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

# Install dependencies (only the api workspace)
RUN pnpm install --frozen-lockfile --filter @indie-owls/api

# Copy source
COPY apps/api apps/api
COPY packages packages

# Build the API
RUN pnpm --filter @indie-owls/api build

# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built output + production dependencies
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/package.json package.json
COPY --from=build /app/pnpm-lock.yaml pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile --filter @indie-owls/api --prod

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
