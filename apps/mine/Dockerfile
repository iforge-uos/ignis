FROM 1password/op:2 as op
FROM rust:1-alpine AS build
RUN apk add musl-dev
COPY apps/mine /app/apps/mine
WORKDIR /app/apps/mine
RUN cargo build --release

FROM alpine:latest as mine
WORKDIR /app
COPY --from=build /app/apps/mine/target/release/mine ./mine

# Create iforge user and set ownership
RUN adduser -D iforge
RUN chown -R iforge:iforge /app

# Copy 1Password home directory from the op image
COPY --from=op --chown=iforge:iforge /home/opuser/ /home/iforge/
COPY --from=op /usr/local/bin/op /usr/local/bin/op

USER iforge

EXPOSE 4000
CMD ["/usr/local/bin/op", "run", "--env-file=/config/.env.production.tpl", "--", "/app/mine"]
