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
GOOGLE_CLIENT_CALLBACK_URL="http://127.0.0.1:3000/v1/authentication/google/callback"
GOOGLE_SERVICE_ACCOUNT_EMAIL="op://IT/Google Cloud/email"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="op://IT/Google Cloud/private key"

# Discord
DISCORD_CLIENT_ID="op://IT/Anvil OAuth2 Discord/client id"
DISCORD_CLIENT_SECRET="op://IT/Anvil OAuth2 Discord/client secret"
DISCORD_CLIENT_CALLBACK_URL="http://127.0.0.1:3000/v1/authentication/discord/callback"

# AUTH
JWT_SECRET="op://Employee/JWT Secret Key/password"
CSRF_SECRET="op://Employee/CSRF Secret Key/password"
CSRF_EXCLUDE_ROUTES=v1/authentication/login,POST;v1/authentication/refresh,POST
ACCESS_TOKEN_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"
ADMIN_ROLE="5ea86cc8-f86c-11ee-8cfe-bfcf9fe5f446"

# Email
EMAIL_HOST="op://Employee/Mailtrap Email Account/SMTP/SMTP server"
EMAIL_PORT="op://Employee/Mailtrap Email Account/SMTP/port number"
EMAIL_USER="op://Employee/Mailtrap Email Account/SMTP/username"
EMAIL_PASS="op://Employee/Mailtrap Email Account/SMTP/password"
EMAIL_FROM="iforge@sheffield.ac.uk"
EMAIL_LOCAL_DOMAIN="127.0.0.1"
EMAIL_SMTP_REQUIRE_TLS=true
EMAIL_RATE_MAX="50"        # Max number of emails per processor per EMAIL_RATE_DURATION
EMAIL_RATE_DURATION="1000" # Milliseconds

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
REDIS_DB="0"
REDIS_PASSWORD="op://Employee/Ignis Redis Password/password"

# CDN
CDN_URL="http://[::]:4000"

# Front End
FRONT_END_URL="http://127.0.0.1:8000"

# Logging
LOG_LEVEL=debug
