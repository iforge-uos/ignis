#!/bin/sh
set -e

echo "Waiting for Gel..."
until curl -sfk https://localhost:10705/server/status/ready >/dev/null; do sleep 2; done

gel instance link ignis --host localhost --port 10705 --user admin --branch main \
  --trust-tls-cert --non-interactive --overwrite
gel project init --link --server-instance ignis --non-interactive
bun install
