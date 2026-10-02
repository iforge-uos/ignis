Dev container can be launched separately from VSCode extension with

```sh
bunx @devcontainers/cli up --workspace-folder .
```

And to get a shell in the container:

```sh
docker exec -it -w /workspaces/ignis ignis_devcontainer-workspace-1 bash
```

## Running `bun dev`

forge's and mine's dev scripts wrap everything in `op run`, so the 1Password CLI needs to be signed in
inside the container. Either:

- **Service account** (no sign-in): export `OP_SERVICE_ACCOUNT_TOKEN` on the host before the container
  is created; it's passed through to the container. The service account needs read access to the
  `Ignis` and `IT` vaults.
- **Your own account**: in the container terminal, run `op account add --address iforge.1password.com`
  once (it's kept in the `op_config` volume across rebuilds), then `eval $(op signin)` in each new shell
  (sessions expire after 30 minutes of inactivity). Remove the volume to forget the account.

Gel and Valkey share the workspace container's network, so the `localhost` addresses in
`apps/forge/.env.dev` (Gel on `10705`, Redis on `6379`) work unchanged. Gel runs in insecure dev mode:
the `admin` user is accepted with any password. Valkey has no password; ioredis warns that one was
supplied and carries on.

## Google sign-in

The container's Gel starts with its auth extension unconfigured. Once 1Password is signed in, run

```sh
sh .devcontainer/configure-gel-auth.sh
```

It sets a signing key, allows redirects back to `http://localhost:3000` (and `127.0.0.1:3000`), and adds
the Google provider using the client ID and secret from `apps/forge/.env.dev`. The config lives in the
`gel_data` volume, so it only needs rerunning if that volume is removed. Each run sets a new signing key,
which signs everyone out. Google redirects to Gel at `http://localhost:10705/db/main/ext/auth/callback`.

## Ports

Docker publishes forge (`3000`), its websocket (`3001`), mine (`4000`) and Gel (`10705`, admin UI at
`/ui`) on the host's `127.0.0.1`, so they work whether the container was started by VS Code or by the
devcontainers CLI (which does no port forwarding). VS Code's own forwarding is turned off for them.
Published ports arrive on the container's network interface rather than its loopback, so the container
sets `DEV_HOST=0.0.0.0`, which `apps/forge/vite.config.ts` uses as Vite's listen address.

## Rebuilding

Use "Dev Containers: Rebuild Container" (or `docker compose ... up -d --build --force-recreate`).
Recreating only the `workspace` service leaves `gel` and `valkey` attached to the old container's
network, and they become unreachable.

The first start applies all migrations, which takes around 10 minutes.
