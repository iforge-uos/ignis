#!/bin/bash
# deploy/scripts/lib/common.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Common variables
# DEPLOY_ROOT resolves to ../../../ relative to the script's current location
DEPLOY_ROOT=$(dirname $(dirname $(dirname $(realpath $0))))/deploy
COMPOSE_DIR="${DEPLOY_ROOT}/compose"
CONFIG_DIR="${DEPLOY_ROOT}/config"
SECRET_DIR="${DEPLOY_ROOT}/secret"

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Validation functions
validate_environment() {
    local env=$1
    if [[ ! "$env" =~ ^(production|staging|development)$ ]]; then
        log_error "Invalid environment: $env"
        return 1
    fi
}

validate_stack() {
    local stack=$1
    if [[ ! "$stack" =~ ^(apps|infra|proxy)$ ]]; then
        log_error "Invalid stack: $stack"
        return 1
    fi
}
