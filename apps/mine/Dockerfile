FROM rust:1-alpine AS build
RUN apk add musl-dev
COPY apps/mine /app/apps/mine
WORKDIR /app/apps/mine
RUN cargo build --release

FROM alpine:latest AS mine
WORKDIR /app

# Install necessary runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

COPY --from=build /app/apps/mine/target/release/mine ./mine

# Create directories for files, icons, logos, and fonts
RUN mkdir -p /app/files /app/icons /app/logos /app/fonts
RUN chmod 755 /app/files /app/icons /app/logos /app/fonts

# Create iforge user and set ownership
RUN adduser -D iforge
RUN chown -R iforge:iforge /app

# Set environment variables
ENV CONTENT_BASE_DIR=/app
ENV RUST_BACKTRACE=1
ENV RUST_LOG=info

USER iforge

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q --spider http://localhost:4000/health || exit 1

EXPOSE 4000
CMD ["/app/mine"]
