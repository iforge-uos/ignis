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
# Use build args for environment variables instead of hardcoding
ARG VITE_API_URL="https://api.iforge.sheffield.ac.uk/v1"
ARG VITE_DISCORD_URL="https://discord.gg/AkTDMga"
ARG VITE_CDN_URL="https://cdn.iforge.sheffield.ac.uk"
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DISCORD_URL=${VITE_DISCORD_URL}
ENV VITE_CDN_URL=${VITE_CDN_URL}
RUN pnpm exec turbo build


FROM nginx:alpine AS forge
WORKDIR /app
COPY --from=build /app/apps/forge/dist /usr/share/nginx/html
COPY --from=build /prod/forge/nginx.conf /etc/nginx/conf.d/default.conf
# Add basic security headers
RUN echo "server_tokens off;" > /etc/nginx/conf.d/security.conf
# Enable gzip compression
COPY --from=build /prod/forge/gzip.conf /etc/nginx/conf.d/gzip.conf
EXPOSE 80

# Create simple startup script to display nginx version
COPY --from=build /prod/forge/startup.sh /startup.sh
RUN chmod +x /startup.sh

CMD ["/startup.sh"]
