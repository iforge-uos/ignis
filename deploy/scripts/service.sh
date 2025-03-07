#!/bin/bash
# deploy/scripts/service.sh

source $(dirname "$0")/lib/common.sh

usage() {
    echo "Service management script"
    echo
    echo "Usage: $0 <environment> <service> <command> [options]"
    echo
    echo "Commands:"
    echo "  deploy <tag>    Deploy/update service"
    echo "  restart        Force restart service"
    echo "  logs           View service logs"
    echo "  scale <num>    Scale service"
    echo "  config         Show service config"
}

get_stack_for_service() {
    local service=$1
    case "$service" in
        anvil|forge|mine)
            echo "apps"
            ;;
        db|valkey)
            echo "infra"
            ;;
        traefik)
            echo "proxy"
            ;;
        *)
            log_error "Unknown service: $service"
            exit 1
            ;;
    esac
}

deploy_service() {
    local env=$1
    local service=$2
    local tag=$3
    local stack=$(get_stack_for_service "$service")

    log_info "Updating $service to version $tag..."

    docker service update \
        --image "${REGISTRY}/ignis/${service}:${tag}" \
        --with-registry-auth \
        "ignis-${stack}_${service}"
}

# Main command processing
if [ $# -lt 3 ]; then
    usage
    exit 1
fi

ENVIRONMENT=$1
SERVICE=$2
COMMAND=$3
shift 3

case "$COMMAND" in
    deploy)
        deploy_service "$ENVIRONMENT" "$SERVICE" "$1"
        ;;
    restart)
        docker service update --force "ignis-$(get_stack_for_service $SERVICE)_${SERVICE}"
        ;;
    logs)
        docker service logs "ignis-$(get_stack_for_service $SERVICE)_${SERVICE}" "$@"
        ;;
    scale)
        docker service scale "ignis-$(get_stack_for_service $SERVICE)_${SERVICE}=$1"
        ;;
    config)
        if [ -f "${CONFIG_DIR}/${SERVICE}/.env.${ENVIRONMENT}.tpl" ]; then
            cat "${CONFIG_DIR}/${SERVICE}/.env.${ENVIRONMENT}.tpl"
        else
            log_error "No config found for $SERVICE"
            exit 1
        fi
        ;;
    *)
        usage
        exit 1
        ;;
esac
