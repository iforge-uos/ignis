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
COPY apps/forge/package.json ./apps/forge/package.json
RUN pnpm install --frozen-lockfile
COPY apps/forge ./apps/forge

FROM deps AS build
WORKDIR /app
RUN pnpm deploy --filter=forge --prod /prod/forge
ENV VITE_API_URL="https://iforge.sheffield.ac.uk/api/v1"
RUN pnpm exec turbo build


FROM nginx:alpine AS forge
WORKDIR /app
COPY --from=build /app/apps/forge/dist /usr/share/nginx/html
COPY --from=build /prod/forge/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
