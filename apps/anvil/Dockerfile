FROM node:22-alpine AS deps
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

# Fetch gel-cli image in its own stage
FROM geldata/gel-cli AS gel
# Copy gel binary and run regeneration steps
FROM deps AS regen
WORKDIR /app
COPY --from=gel /usr/bin/gel /usr/bin/gel

# Create /prod directory before switching user
RUN mkdir /prod

# Create a non-root user and set ownership
RUN adduser -D -h /home/iforge -s /bin/sh iforge
RUN chown -R iforge:iforge /app /prod
USER iforge

WORKDIR /app/apps/anvil
RUN gel project init --non-interactive --server-instance="ignis" && \
    pnpm regen
WORKDIR /app

# Build the app once all the CICD generated files are available
FROM regen AS build
WORKDIR /app
RUN pnpm deploy --filter=anvil --prod /prod/anvil
RUN pnpm exec turbo build


# Final Stage
FROM node:22-slim AS anvil
WORKDIR /app
COPY --from=build /prod/anvil ./
COPY --from=build /app/apps/anvil/dist ./dist

# Create iforge user and set ownership
RUN useradd -m iforge
RUN chown -R iforge:iforge /app

USER iforge

EXPOSE 3000
ENV NODE_PATH=/app/node_modules
CMD ["node", "dist/src/main.js"]
