# LDAP
LDAP_HOST="ldap://auth.shef.ac.uk"
LDAP_PORT=389
LDAP_BASE="ou=Users,dc=sheffield,dc=ac,dc=uk"

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
JWT_SECRET="op://Private/JWT Secret Key/password"
ACCESS_TOKEN_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email
EMAIL_HOST="op://Private/Mailtrap Email Account/SMTP/SMTP server"
EMAIL_PORT="op://Private/Mailtrap Email Account/SMTP/port number"
EMAIL_USER="op://Private/Mailtrap Email Account/SMTP/username"
EMAIL_PASS="op://Private/Mailtrap Email Account/SMTP/password"
EMAIL_FROM="iforge@sheffield.ac.uk"
EMAIL_SMTP_REQUIRE_TLS=true
EMAIL_RATE_MAX=50  # Max number of emails per processor per EMAIL_RATE_DURATION
EMAIL_RATE_DURATION=1000  # Milliseconds

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_DB="0"

# Training
TRAINING_URL="https://training.iforge.sheffield.ac.uk"
TRAINING_SITE_USERNAME="op://IT/Sheffield Login/username"
TRAINING_SITE_PASSWORD="op://IT/Sheffield Login/password"

# CDN
CDN_URL="http://[::]:4000"

# Front End
FRONT_END_URL="http://127.0.0.1:8000"

# DB
EDGEDB_DSN="op://IT/Ignis EdgeDB Docker Prod/EDGEDB_DSN"
NODE_EXTRA_CA_CERTS="/ignis_certs/ignis_cert.pem"