#!/bin/bash
# deploy/scripts/compose.sh

source $(dirname "$0")/lib/common.sh

usage() {
    echo "Docker compose stack management"
    echo
    echo "Usage: $0 <environment> <stack> <command> [options]"
    echo
    echo "Stacks: acanpps, infra, proxy"
    echo "Commands: deploy, remove, status"
}

deploy_stack() {
    local env=$1
    local stack=$2

    validate_environment "$env" || exit 1
    validate_stack "$stack" || exit 1

    log_info "Deploying $stack stack in $env environment..."

    # Export environment variables
    export ENVIRONMENT=$env
    export $(cat ${CONFIG_DIR}/${env}/.env | xargs)

    docker stack deploy \
        -c "${COMPOSE_DIR}/${stack}.yml" \
        "ignis-${stack}"
}

remove_stack() {
    local stack=$1
    validate_stack "$stack" || exit 1

    log_info "Removing $stack stack..."
    docker stack rm "ignis-${stack}"
}

stack_status() {
    local stack=$1
    validate_stack "$stack" || exit 1

    log_info "Status for $stack stack:"
    docker stack ps "ignis-${stack}"
}

# Main command processing
if [ $# -lt 3 ]; then
    usage
    exit 1
fi

ENVIRONMENT=$1
STACK=$2
COMMAND=$3

case "$COMMAND" in
    deploy)
        deploy_stack "$ENVIRONMENT" "$STACK"
        ;;
    remove)
        remove_stack "$STACK"
        ;;
    status)
        stack_status "$STACK"
        ;;
    *)
        usage
        exit 1
        ;;
esac
