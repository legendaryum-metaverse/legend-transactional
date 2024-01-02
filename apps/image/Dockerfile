FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN apk update

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# it will identify whatever package manager is configured for the current project,
# transparently install it if needed, and finally run it without requiring explicit user interactions.
RUN corepack enable

FROM base AS pruner

WORKDIR /app

RUN pnpm install turbo --global
RUN pnpm install "@swc/cli" --global
RUN pnpm install tsup --global
RUN pnpm install typescript --global

COPY . ./


RUN turbo prune --scope=micro-image --docker

# Add lockfile and package.json's of isolated subworkspace
FROM pruner AS installer

WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=pruner /app/.gitignore .gitignore
RUN true
COPY --from=pruner /app/out/json/ /app/json/
RUN true
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN true
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -P

# Build the project
COPY --from=pruner /app/out/full/ /app/full/
RUN true
COPY --from=pruner /app/turbo.json /app/turbo.json
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# https://github.com/vercel/turbo/issues/5087
RUN turbo build --filter=micro-image --no-daemon

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN #addgroup --system --gid 1001 expressjs
RUN #adduser --system --uid 1001 expressjs
#USER expressjs
COPY --from=installer /app .

#CMD node apps/image/dist/server.js
CMD cd apps/mocks/image && pnpm start
