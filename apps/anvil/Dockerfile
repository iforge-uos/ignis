FROM node:20-alpine AS deps
WORKDIR /app

# Setup PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# PNPM lock + tubo build files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Packages and Tooling will change less
COPY packages/ ./packages
COPY tooling/ ./tooling
COPY apps/anvil/package.json ./apps/anvil/package.json
RUN pnpm install --frozen-lockfile
COPY apps/anvil ./apps/anvil
COPY .turbo ./turbo

FROM deps AS build
WORKDIR /app
# Generate any needed files https://discord.com/channels/841451783728529451/1122688204152246282/1123031495121051739 <- maybe dooable
#WORKDIR /app/apps/anvil
#RUN pnpm regen
RUN pnpm deploy --filter=anvil --prod /prod/forge
RUN pnpm exec turbo build


FROM node:20-slim AS anvil
WORKDIR /app
COPY --from=build /prod/forge ./
COPY --from=build /app/apps/anvil/dist ./dist
EXPOSE 3000
ENV NODE_PATH=/app/node_modules
CMD node dist/src/main.js
