# LDAP
LDAP_HOST="op://IT/Active LDAP/Host/LDAP_HOST"
LDAP_PORT="op://IT/Active LDAP/Host/LDAP_PORT"
LDAP_BASE="dc=shefuniad,dc=shef,dc=ac,dc=uk"
LDAP_USER="op://IT/Active LDAP/username"
LDAP_PASS="op://IT/Active LDAP/password"
LDAP_DEFAULT_ATTRIBUTES="givenName,sn,mail,uid,shefLibraryNumber,ou"
LDAP_SSL=true

# Google
GOOGLE_CLIENT_ID="op://IT/Anvil OAuth2 Google/client id"
GOOGLE_CLIENT_SECRET="op://IT/Anvil OAuth2 Google/client secret"
GOOGLE_CLIENT_CALLBACK_URL="https://iforge.sheffield.ac.uk/api/v1/authentication/google/callback"
GOOGLE_SERVICE_ACCOUNT_EMAIL="op://IT/Google Cloud/email"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="op://IT/Google Cloud/private key"

# Discord
DISCORD_CLIENT_ID="op://IT/Anvil OAuth2 Discord/client id"
DISCORD_CLIENT_SECRET="op://IT/Anvil OAuth2 Discord/client secret"
DISCORD_CLIENT_CALLBACK_URL="http://127.0.0.1:3000/api/v1/authentication/discord/redirect"

# AUTH
JWT_SECRET="op://IT/Anvil JWT Signing Key/credential"
CSRF_SECRET="op://IT/Anvil CSRF Secret Key/credential"
CSRF_EXCLUDE_ROUTES=auth/login,POST;auth/refresh,POST
ACCESS_TOKEN_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email
EMAIL_HOST="op://IT/Anvil MailServer Credentials/server"
EMAIL_PORT="op://IT/Anvil MailServer Credentials/port number"
EMAIL_USER="op://IT/Sheffield Login/email"
EMAIL_PASS="op://IT/Sheffield Login/App Password"
EMAIL_FROM="iforge@sheffield.ac.uk"
EMAIL_LOCAL_DOMAIN="iforge.sheffield.ac.uk"
EMAIL_SMTP_REQUIRE_TLS=true
EMAIL_RATE_MAX="50"        # Max number of emails per processor per EMAIL_RATE_DURATION
EMAIL_RATE_DURATION="1000" # Milliseconds

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
REDIS_DB="0"
REDIS_PASSWORD="op://IT/Ignis Redis Password/password"

# CDN
CDN_URL="https://cdn.iforge.sheffield.ac.uk"
ANVIL_PORT=3000

# Front End
FRONT_END_URL="https://iforge.sheffield.ac.uk"

# DB
EDGEDB_DSN="op://IT/Ignis EdgeDB Docker Prod/EDGEDB_DSN"
NODE_EXTRA_CA_CERTS="/ignis_certs/ignis_cert.pem"

# Logging
LOG_LEVEL=info