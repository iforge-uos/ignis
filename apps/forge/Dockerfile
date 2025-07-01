FROM oven/bun:1 AS deps
WORKDIR /app

# Bun lock + turbo build files
COPY package.json bun.lock turbo.json ./

# Packages and Tooling will change less
COPY packages/ ./packages
COPY tooling/ ./tooling
COPY apps/forge/package.json ./apps/forge/package.json
RUN bun install --frozen-lockfile
COPY apps/forge ./apps/forge

FROM deps AS build
WORKDIR /app
# Note: bun doesn't have exact equivalent to pnpm deploy, using regular install
RUN bun install --production --cwd /prod/forge
ENV VITE_API_URL="https://iforge.sheffield.ac.uk/api/v1"
RUN bun run build


FROM nginx:alpine as forge
WORKDIR /app
COPY --from=build /app/apps/forge/dist /usr/share/nginx/html
COPY --from=build /prod/forge/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
