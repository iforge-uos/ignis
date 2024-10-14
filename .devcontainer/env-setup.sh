#!/bin/bash

set -e

echo "Initialising environment for dev container"

# Need to do the following:
# 1. Take the main environment template file for development then use the onepassword cli to create a local env file with the values inserted
# 2. Generate new certificates that will handle authenticating the connection between edgedb and the dev container
# 3. Generate dsn string needed in the env for the dev container
# 4. Generate the KV password and insert that in the env as well

echo "------"

# Check if op cli is installed
if ! command -v op &> /dev/null
then
    echo "The 1Password CLI ('op') is not installed."
    echo "Please install it by following the instructions at:"
    echo "https://developer.1password.com/docs/cli/get-started#install"
    exit 1
fi

echo "1Password CLI is installed. Continuing..."

TEMPLATE_FILE="./.env.tpl"
ENV_FILE="./.env"

# Check if the template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Template file '$TEMPLATE_FILE' not found."
    exit 1
fi

echo "Creating '$ENV_FILE' from '$TEMPLATE_FILE'..."

# Clear the existing .env file if it exists
: > "$ENV_FILE"

# Use op inject to process the template and output to .env
if ! OP_ACCOUNT=iforge.1password.com op inject -f -i "$TEMPLATE_FILE" -o "$ENV_FILE"; then
    echo "Failed to create '$ENV_FILE' using op inject."
    exit 1
fi

echo "Clearing existing SSL certificates..."
rm -f ./config/secret/db/ignis_key.pem ./config/secret/db/ignis_cert.pem

echo "Generating fresh SSL certificates..."

if ! openssl req -x509 -newkey rsa:4096 -keyout ./config/secret/db/ignis_key.pem -out ./config/secret/db/ignis_cert.pem \
-days 3650 -nodes -subj "/C=GB/ST=South Yorkshire/L=Sheffield/O=iForge Makerspace/OU=IT Team/CN=db"; then
      echo "Failed to generate SSL certificates."
      exit 1
fi

echo "Fresh certificates have been generated in './config/secret/db'."

# Remove all node_modules directories recursively within the monorepo
MONOREPO_ROOT="./"

echo "Removing all node_modules directories within the monorepo..."

# Find and delete all node_modules directories
find "$MONOREPO_ROOT" -type d -name "node_modules" -prune -exec rm -rf '{}' +

echo "All node_modules directories have been removed."


echo "Adding configurations and generated passwords to '$ENV_FILE'..."

EDGEDB_SERVER_PASSWORD=$(openssl rand -base64 32)
KV_PASSWORD=$(openssl rand -base64 32)

# Add EdgeDB configurations, KV password, and email configurations to .env
cat <<EOL >> "$ENV_FILE"

# EdgeDB server configurations
EDGEDB_SERVER_ADMIN_UI=enabled
EDGEDB_SERVER_TLS_CERT_MODE=require_file
EDGEDB_SERVER_TLS_KEY_FILE=/ignis_certs/ignis_key.pem
EDGEDB_SERVER_TLS_CERT_FILE=/ignis_certs/ignis_cert.pem
EDGEDB_SERVER_PASSWORD=$EDGEDB_SERVER_PASSWORD

# Construct DSN
EDGEDB_DSN=edgedb://\$EDGEDB_USER:\$EDGEDB_PASSWORD@\$EDGEDB_HOST:\$EDGEDB_PORT/\$EDGEDB_DATABASE

# KV password
KV_PASSWORD=$KV_PASSWORD

# Email configurations for MailHog
EMAIL_HOST=mailhog
EMAIL_PORT=1025
EMAIL_USE_TLS=False
EMAIL_USE_SSL=False
EMAIL_HOST_USER=''
EMAIL_HOST_PASSWORD=''

EOL

echo "Configurations and generated passwords have been added to '$ENV_FILE'."


echo "Environment initialization completed successfully."
