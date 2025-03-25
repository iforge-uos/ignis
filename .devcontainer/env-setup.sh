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
rm -f ./config/secret/db/ignis_key.pem ./config/secret/db/ignis_cert.pem ./config/secret/db/ca_cert.pem ./config/secret/db/ca_key.pem

echo "Generating SSL certificates..."
mkdir -p ./config/secret/db

# Generate CA key and certificate
openssl req -x509 -newkey rsa:4096 \
    -keyout ./config/secret/db/ca_key.pem \
    -out ./config/secret/db/ca_cert.pem \
    -days 3650 -nodes \
    -subj "/C=GB/ST=South Yorkshire/L=Sheffield/O=iForge Makerspace/OU=IT Team/CN=iForge CA" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,digitalSignature,keyCertSign,cRLSign"

# Generate server key
openssl genrsa -out ./config/secret/db/ignis_key.pem 4096

# Generate server CSR
openssl req -new \
    -key ./config/secret/db/ignis_key.pem \
    -out ./config/secret/db/ignis.csr \
    -subj "/C=GB/ST=South Yorkshire/L=Sheffield/O=iForge Makerspace/OU=IT Team/CN=db"

# Sign the server certificate with our CA
openssl x509 -req \
    -in ./config/secret/db/ignis.csr \
    -CA ./config/secret/db/ca_cert.pem \
    -CAkey ./config/secret/db/ca_key.pem \
    -CAcreateserial \
    -out ./config/secret/db/ignis_cert.pem \
    -days 3650 \
    -extfile <(printf "subjectAltName=DNS:db,DNS:localhost,IP:127.0.0.1\nbasicConstraints=critical,CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth,clientAuth")

# Clean up CSR and serial
rm ./config/secret/db/ignis.csr ./config/secret/db/ca_cert.srl

# Set proper permissions
chmod 644 ./config/secret/db/ca_cert.pem
chmod 644 ./config/secret/db/ignis_cert.pem
chmod 600 ./config/secret/db/ignis_key.pem
chmod 600 ./config/secret/db/ca_key.pem

echo "SSL certificates generated successfully"

# Remove all node_modules directories recursively within the monorepo
MONOREPO_ROOT="./"

echo "Removing all node_modules directories within the monorepo..."

# Find and delete all node_modules directories
find "$MONOREPO_ROOT" -type d -name "node_modules" -prune -exec rm -rf '{}' +

echo "All node_modules directories have been removed."


echo "Adding configurations and generated passwords to '$ENV_FILE'..."


# Add EdgeDB configurations, KV password, and email configurations to .env
cat <<EOL >> "$ENV_FILE"

# Email configurations for MailHog
EMAIL_HOST="mailhog"
EMAIL_PORT="1025"
EMAIL_USE_TLS="False"
EMAIL_USE_SSL="False"
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""

EOL

echo "Configurations and generated passwords have been added to '$ENV_FILE'."

echo "Creating EdgeDB environment file..."
EDGEDB_ENV_FILE="./config/secret/db/.env"

# Function to parse DSN
parse_dsn() {
    local dsn=$1
    # Remove edgedb:// prefix
    local cleaned_dsn=${dsn#edgedb://}

    # Extract user and password
    local userpass=${cleaned_dsn%%@*}
    local user=${userpass%%:*}
    local password=${userpass#*:}

    # Extract host, port and database
    local hostportdb=${cleaned_dsn#*@}
    local host=${hostportdb%%:*}
    local portdb=${hostportdb#*:}
    local port=${portdb%%/*}
    local database=${portdb#*/}

    # Write to EdgeDB env file
    cat <<EOL > "$EDGEDB_ENV_FILE"
EDGEDB_SERVER_USER="$user"
EDGEDB_SERVER_PASSWORD="$password"
EDGEDB_SERVER_HOST="$host"
EDGEDB_SERVER_PORT="$port"
EDGEDB_SERVER_DEFAULT_BRANCH="$database"
EDGEDB_SERVER_ADMIN_UI="enabled"
EDGEDB_SERVER_TLS_CERT_MODE="require_file"
EDGEDB_SERVER_TLS_KEY_FILE="/ignis_certs/ignis_key.pem"
EDGEDB_SERVER_TLS_CERT_FILE="/ignis_certs/ignis_cert.pem"
EOL
}

# Get the DSN from the main .env file
DSN=$(grep EDGEDB_DSN "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [ -n "$DSN" ]; then
    echo "Found EdgeDB DSN, parsing components..."
    parse_dsn "$DSN"
    echo "EdgeDB environment file created at $EDGEDB_ENV_FILE"
else
    echo "Error: EDGEDB_DSN not found in $ENV_FILE"
    exit 1
fi



echo "Environment initialization completed successfully."
