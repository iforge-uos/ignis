#!/bin/sh
# Configures Gel's auth extension on the devcontainer's database so Google sign-in works.
# Needs 1Password signed in (`eval $(op signin)`); reads the same secrets as `bun dev`.
# Safe to rerun, but each run sets a new signing key, which signs everyone out.
set -e
cd "$(dirname "$0")/.."

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  exec env OP_ACCOUNT=iforge.1password.com op run --env-file=apps/forge/.env.dev -- sh .devcontainer/configure-gel-auth.sh
fi

# .env.dev's connection settings are forge's; they clash with the CLI's GEL_INSTANCE link
unset GEL_HOST GEL_PORT GEL_USERNAME GEL_PASSWORD GEL_TLS_CA_FILE GEL_CLIENT_TLS_SECURITY

signing_key=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')

# $$-quoted strings so the secrets need no escaping; sent on stdin to keep them out of `ps`
gel <<EOF
configure current branch set ext::auth::AuthConfig::auth_signing_key := \$\$${signing_key}\$\$;
configure current branch set ext::auth::AuthConfig::allowed_redirect_urls := {'http://localhost:3000', 'http://127.0.0.1:3000'};
configure current branch reset ext::auth::GoogleOAuthProvider;
configure current branch insert ext::auth::GoogleOAuthProvider {
  client_id := \$\$${GOOGLE_CLIENT_ID}\$\$,
  secret := \$\$${GOOGLE_CLIENT_SECRET}\$\$,
};
EOF

echo "Gel auth configured for Google sign-in"
