FROM 1password/op:2 as op
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

# Create iforge user and set ownership
RUN useradd -m iforge
RUN chown -R iforge:iforge /app

# Copy 1Password home directory from the op image
COPY --from=op --chown=iforge:iforge /home/opuser/ /home/iforge/
COPY --from=op /usr/local/bin/op /usr/local/bin/op

USER iforge

EXPOSE 3000
ENV NODE_PATH=/app/node_modules
CMD ["/usr/local/bin/op", "run", "--env-file=/config/.env.production.tpl", "--", "node", "dist/src/main.js"]
