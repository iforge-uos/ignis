FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Install corepack, Rust, and additional necessary packages
RUN corepack enable && apt-get update && apt-get install -y curl git build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
# Add Rust to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /usr/src/app/
RUN pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=anvil --prod /prod/anvil
RUN pnpm deploy --filter=forge --prod /prod/forge

FROM base AS anvil
COPY --from=build /prod/anvil /prod/anvil
# If its cursed and it works is it really cursed?
COPY --from=build /usr/src/app/apps/anvil/dist /prod/anvil/dist
# End curse
WORKDIR /prod/anvil
EXPOSE 3000
CMD ["pnpm", "start:prod:docker"]

FROM nginx:alpine as forge
COPY --from=build /prod/forge /usr/share/nginx/html
COPY --from=build /usr/src/app/apps/forge/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


