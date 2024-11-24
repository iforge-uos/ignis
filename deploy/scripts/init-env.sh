#!/bin/bash
# deploy/scripts/init-env.sh

source $(dirname "$0")/lib/common.sh

# Set 1Password account
export OP_ACCOUNT="iforge.1password.com"

usage() {
    echo "Environment initialization script"
    echo
    echo "Usage: $0 <environment> [options]"
    echo
    echo "Environments:"
    echo "  production    Production environment"
    echo "  staging       Staging environment"
    echo "  development   Development environment"
    echo
    echo "Options:"
    echo "  --service=<service>   Initialize specific service (anvil,mine,db,traefik)"
    echo "  --force              Force overwrite existing .env files"
}

# Check 1Password CLI
check_op() {
    if ! command -v op &> /dev/null; then
        log_error "1Password CLI (op) is not installed"
        exit 1
    fi

    # Check if we're authenticated
    if ! op account list &> /dev/null; then
        log_error "Not authenticated with 1Password. Please run 'op signin'"
        exit 1
    fi
}

# Process template file using 1Password CLI
process_template() {
    local service=$1
    local env=$2
    local template="${CONFIG_DIR}/${service}/.env.${env}.tpl"
    local output="${CONFIG_DIR}/${service}/.env"

    if [ ! -f "$template" ]; then
        log_error "Template file not found: $template"
        return 1
    fi

    if [ -f "$output" ] && [ "$FORCE" != "true" ]; then
        log_warn "Environment file already exists: $output"
        log_warn "Use --force to overwrite"
        return 1
    fi

    log_info "Processing template for ${service} (${env})..."

    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$output")"

    # Process template with 1Password, using force flag if specified
    if [ "$FORCE" = "true" ]; then
        if ! op inject -f -i "$template" -o "$output"; then
            log_error "Failed to process template: $template"
            return 1
        fi
    else
        if ! op inject -i "$template" -o "$output"; then
            log_error "Failed to process template: $template"
            return 1
        fi
    fi

    log_info "Created environment file: $output"
}

# Initialize environment for a service
init_service_env() {
    local service=$1
    local env=$2

    case "$service" in
        anvil)
            # First process template to get base configuration
            process_template "$service" "$env"

            # Get processed env file
            local env_file="${CONFIG_DIR}/${service}/.env"
            if [ -f "$env_file" ]; then
                # Add TLS configuration for EdgeDB client
                cat >> "$env_file" << EOL

# EdgeDB TLS Configuration
EDGEDB_TLS_CA_FILE=/run/secrets/ca_cert
EDGEDB_TLS_CERT_FILE=/run/secrets/client_cert
EDGEDB_TLS_KEY_FILE=/run/secrets/client_key
EOL
                log_info "Added EdgeDB TLS configuration"
            else
                log_error "Environment file not found after template processing"
                return 1
            fi
            ;;
        mine)
            process_template "$service" "$env"
            ;;
        db)
            # First process template to get DSN
            process_template "$service" "$env"

            # Get processed env file
            local env_file="${CONFIG_DIR}/${service}/.env"
            if [ -f "$env_file" ]; then
                # Extract DSN and remove the line
                local dsn=$(grep EDGEDB_DSN "$env_file" | cut -d '=' -f2- | tr -d '"')
                dsn=$(echo "$dsn" | op inject)

                if [ -n "$dsn" ]; then
                    log_info "Parsing EdgeDB DSN..."

                    # Remove edgedb:// prefix
                    local cleaned_dsn=${dsn#edgedb://}

                    # Extract components
                    local userpass=${cleaned_dsn%%@*}
                    local user=${userpass%%:*}
                    local password=${userpass#*:}
                    local hostportdb=${cleaned_dsn#*@}
                    local host=${hostportdb%%:*}
                    local portdb=${hostportdb#*:}
                    local port=${portdb%%/*}
                    local database=${portdb#*/}

                    # Create new env file without DSN
                    cat > "$env_file" << EOL
# EdgeDB Server Configuration
EDGEDB_SERVER_USER="$user"
EDGEDB_SERVER_PASSWORD="$password"
EDGEDB_SERVER_HOST="$host"
EDGEDB_SERVER_PORT="$port"
EDGEDB_SERVER_DEFAULT_BRANCH="$database"
EDGEDB_SERVER_ADMIN_UI=enabled
EDGEDB_SERVER_TLS_CERT_MODE=require_file
EDGEDB_SERVER_TLS_KEY_FILE=/run/secrets/server_key
EDGEDB_SERVER_TLS_CERT_FILE=/run/secrets/server_cert
EDGEDB_SERVER_TLS_CA_FILE=/run/secrets/ca_cert
EOL
                    log_info "EdgeDB configuration created successfully"
                else
                    log_error "No DSN found in environment file"
                    return 1
                fi
            else
                log_error "Environment file not found after template processing"
                return 1
            fi
            ;;
        traefik)
            process_template "$service" "$env"
            if [ -d "${CONFIG_DIR}/${service}/dynamic" ]; then
                for template in "${CONFIG_DIR}/${service}/dynamic"/*.tpl; do
                    if [ -f "$template" ]; then
                        local output="${template%.tpl}"
                        op inject -i "$template" -o "$output"
                        log_info "Processed dynamic config: $(basename "$output")"
                    fi
                done
            fi
            ;;
        *)
            log_error "Unknown service: $service"
            return 1
            ;;
    esac
}

# Parse arguments
ENVIRONMENT=$1
shift

if [ -z "$ENVIRONMENT" ]; then
    usage
    exit 1
fi

validate_environment "$ENVIRONMENT" || exit 1

# Default values
SERVICES="anvil mine db traefik"
FORCE=false

# Parse options
while [ "$1" != "" ]; do
    case $1 in
        --service=*)
            SERVICES="${1#*=}"
            ;;
        --force)
            FORCE=true
            ;;
        *)
            usage
            exit 1
            ;;
    esac
    shift
done

# Check 1Password CLI
check_op

# Initialize environment files
for service in $SERVICES; do
    log_info "Initializing environment for $service..."
    init_service_env "$service" "$ENVIRONMENT"
done

log_info "Environment initialization complete!"
