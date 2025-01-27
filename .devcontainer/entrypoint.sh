#!/bin/bash
set -e

echo "Checking certificate paths and contents..."

# Debug: List all available certificates
echo "Available secrets:"
ls -la /var/run/secrets/

# Create CA certificates directory if it doesn't exist
sudo mkdir -p /usr/local/share/ca-certificates

# Copy both certificates
if [ -f /var/run/secrets/ca_cert ]; then
    echo "Copying CA certificate..."
    sudo cp /var/run/secrets/ca_cert /usr/local/share/ca-certificates/ignis_ca.crt
    echo "✓ CA certificate copied"
else
    echo "ERROR: CA certificate not found in /var/run/secrets/ca_cert"
    exit 1
fi
# Update certificates
echo "Updating CA certificates..."
sudo update-ca-certificates

# Verify certificates were installed
echo "Verifying installed certificates:"
ls -la /usr/local/share/ca-certificates/
ls -la /etc/ssl/certs/ | grep ignis

# Export certificate path for EdgeDB
export EDGEDB_TLS_CA_FILE=/etc/ssl/certs/ca-certificates.crt

# Source profile files if they exist
echo "Sourcing profile files..."
[[ -f /home/iforge/.profile ]] && source /home/iforge/.profile
[[ -f /home/iforge/.bashrc ]] && source /home/iforge/.bashrc
[[ -f /home/iforge/.config/edgedb/env ]] && source /home/iforge/.config/edgedb/env

# Add explicit PATH export
export PATH="/home/iforge/.local/bin:$PATH"

echo "Certificate setup complete. Try connecting with:"
echo "edgedb instance link --tls-ca-file /usr/local/share/ca-certificates/ignis_ca.crt --non-interactive"

# Execute the command passed to docker run
exec "$@"
