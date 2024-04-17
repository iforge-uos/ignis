FROM rust:1.77.2-alpine AS build
RUN apk add musl-dev
COPY apps/mine /app/apps/mine
WORKDIR /app/apps/mine
RUN cargo build --release

FROM scratch as mine
WORKDIR /app
COPY --from=build /app/apps/mine/target/release/mine ./
EXPOSE 4000
CMD ["./mine"]
