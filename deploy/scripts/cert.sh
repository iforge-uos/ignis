#!/bin/bash
# deploy/scripts/cert.sh

source $(dirname "$0")/lib/common.sh

usage() {
    echo "Database certificate management script"
    echo
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  generate    Generate new DB certificates"
    echo "  rotate     Rotate existing DB certificates"
    echo "  verify     Verify certificate validity"
}

generate_db_certs() {
    local cert_dir="${SECRET_DIR}/db"
    mkdir -p "$cert_dir"

    log_info "Generating database certificates..."

    # Generate CA for database
    openssl genrsa -out "${cert_dir}/ca.key" 4096
    openssl req -new -x509 -key "${cert_dir}/ca.key" \
        -out "${cert_dir}/ca.pem" -days 365 \
        -subj "/CN=EdgeDB CA/O=Ignis/C=GB"

    # Generate server certificate
    openssl genrsa -out "${cert_dir}/server.key" 2048
    openssl req -new \
        -key "${cert_dir}/server.key" \
        -out "${cert_dir}/server.csr" \
        -subj "/CN=db.ignis.local/O=Ignis/C=DB"

    # Add Subject Alternative Names (SANs) for the server
    cat > "${cert_dir}/server.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = db.ignis.local
DNS.2 = db
DNS.3 = localhost
EOF

    # Sign server certificate with SANs
    openssl x509 -req \
        -in "${cert_dir}/server.csr" \
        -CA "${cert_dir}/ca.pem" \
        -CAkey "${cert_dir}/ca.key" \
        -CAcreateserial \
        -out "${cert_dir}/server.pem" \
        -days 3650 \
        -extfile "${cert_dir}/server.ext"

    # Generate client certificate
    openssl genrsa -out "${cert_dir}/client.key" 2048
    openssl req -new \
        -key "${cert_dir}/client.key" \
        -out "${cert_dir}/client.csr" \
        -subj "/CN=anvil.ignis.local/O=Ignis/C=GB"

    # Sign client certificate
    openssl x509 -req \
        -in "${cert_dir}/client.csr" \
        -CA "${cert_dir}/ca.pem" \
        -CAkey "${cert_dir}/ca.key" \
        -CAcreateserial \
        -out "${cert_dir}/client.pem" \
        -days 3650

    # Clean up CSR files and ext file
    rm "${cert_dir}"/*.csr "${cert_dir}/server.ext"

    # Set proper permissions
    chmod 600 "${cert_dir}"/*.key
    chmod 644 "${cert_dir}"/*.pem

    log_info "Generated certificates in ${cert_dir}:"
    log_info "  ca.pem      - Certificate Authority certificate"
    log_info "  ca.key      - Certificate Authority private key"
    log_info "  server.pem  - Database server certificate"
    log_info "  server.key  - Database server private key"
    log_info "  client.pem  - Client certificate"
    log_info "  client.key  - Client private key"
}

verify_db_certs() {
    local cert_dir="${SECRET_DIR}/db"

    if [ ! -d "$cert_dir" ]; then
        log_error "Certificate directory not found: $cert_dir"
        return 1
    fi

    local certs=("server.pem" "client.pem")
    local all_valid=true

    for cert in "${certs[@]}"; do
        log_info "Verifying ${cert}..."
        if ! openssl verify -CAfile "${cert_dir}/ca.pem" "${cert_dir}/${cert}"; then
            log_error "Certificate verification failed for ${cert}"
            all_valid=false
        fi
    done

    # Check certificate expiration using openssl
    for cert in "${cert_dir}"/*.pem; do
        # Check if certificate has expired
        if ! openssl x509 -checkend 0 -in "$cert" > /dev/null; then
            log_error "Certificate $(basename $cert) has expired"
            all_valid=false
            continue
        fi

        # Check if certificate will expire in 30 days
        if ! openssl x509 -checkend 2592000 -in "$cert" > /dev/null; then
            log_warn "Certificate $(basename $cert) will expire within 30 days"
            all_valid=false
        fi
    done

    $all_valid || return 1
}

case "$1" in
    generate)
        generate_db_certs
        ;;
    rotate)
        if verify_db_certs; then
            log_warn "Current certificates are still valid. Proceed with rotation? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                generate_db_certs
                log_info "Remember to restart the database service to pick up new certificates"
            fi
        else
            generate_db_certs
            log_info "Remember to restart the database service to pick up new certificates"
        fi
        ;;
    verify)
        verify_db_certs
        ;;
    *)
        usage
        exit 1
        ;;
esac
