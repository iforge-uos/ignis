#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INFRA_DIR="${SCRIPT_DIR}/../infrastructure"

# Default values
CREDENTIALS_PATH="${INFRA_DIR}/../secret/1password-credentials.json"
NAMESPACES=("1password" "gel" "valkey" "ignis")
WATCH_NAMESPACES="1password,gel,valkey,ignis"
CERT_MANAGER_VERSION="v1.13.3"
METRICS_SERVER_VERSION="0.7.2"
TRUST_CERTS=false

# Help function
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  --credentials-path PATH    Path to 1password-credentials.json (default: ./1password-credentials.json)"
  echo "  --namespaces NS1,NS2,...   Comma-separated list of namespaces to create (default: 1password,gel,valkey)"
  echo "  --cert-manager-version     Version of cert-manager to install (default: v1.13.3)"
  echo "  --metrics-server-version   Version of metrics-server to install (default: latest)" 
  echo "  --trust-certs             Trust the Gel CA certificate in the system keychain (macOS only)"
  echo "  --help                     Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --credentials-path)
      CREDENTIALS_PATH="$2"
      shift 2
      ;;
    --namespaces)
      IFS=',' read -ra NAMESPACES <<< "$2"
      WATCH_NAMESPACES="$2"
      shift 2
      ;;
    --cert-manager-version)
      CERT_MANAGER_VERSION="$2"
      shift 2
      ;;
    --metrics-server-version)
      METRICS_SERVER_VERSION="$2"
      shift 2
      ;;
    --trust-certs)
      TRUST_CERTS=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_PATH" ]; then
  echo "Error: 1password-credentials.json file not found at $CREDENTIALS_PATH!"
  echo "Please provide the correct path using --credentials-path option."
  exit 1
fi

# Check if OP_CONNECT_TOKEN is set
if [ -z "${OP_CONNECT_TOKEN}" ]; then
  echo "Error: OP_CONNECT_TOKEN environment variable not set!"
  echo "Please set your 1Password Connect token:"
  echo "export OP_CONNECT_TOKEN='your-token-here'"
  exit 1
fi

# Function to add Helm repositories
add_helm_repos() {
  echo "Adding Helm repositories..."
  helm repo add 1password https://1password.github.io/connect-helm-charts/
  helm repo add cnpg https://cloudnative-pg.github.io/charts
  helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
  helm repo add jetstack https://charts.jetstack.io
  helm repo update
}

# Function to create namespaces
create_namespaces() {
  echo "Creating namespaces..."
  for ns in "${NAMESPACES[@]}"; do
    echo "Creating namespace: $ns"
    kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -
  done
  # Create CloudNative PG namespace
  kubectl create namespace cnpg-system --dry-run=client -o yaml | kubectl apply -f -
  # Create cert-manager namespace
  kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -
}

# Function to clean up existing RBAC resources
cleanup_rbac() {
  echo "Cleaning up any existing RBAC resources..."
  kubectl delete clusterrole onepassword-connect-operator --ignore-not-found
  kubectl delete clusterrolebinding onepassword-connect-operator --ignore-not-found
}

# Function to install CloudNative PostgreSQL operator
install_cnpg() {
  echo "Installing CloudNative PostgreSQL operator..."
  helm upgrade --install cnpg --namespace cnpg-system cnpg/cloudnative-pg
}

# Function to install cert-manager
install_cert_manager() {
  echo "Installing cert-manager..."
  helm upgrade --install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --version ${CERT_MANAGER_VERSION} \
    --set installCRDs=true \
    --wait
 helm upgrade trust-manager jetstack/trust-manager \
    --install \
    --namespace cert-manager \
    --wait

  # Wait for cert-manager webhook to be ready
  echo "Waiting for cert-manager webhook to be ready..."
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=webhook -n cert-manager --timeout=120s
}

# Function to install Metrics Server
install_metrics_server() {
  echo "Installing Metrics Server..."
  helm upgrade --install metrics-server metrics-server/metrics-server \
    --namespace kube-system \
    --version ${METRICS_SERVER_VERSION}

  # Wait for metrics-server to be ready
  echo "Waiting for Metrics Server to be ready..."
  kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
}

# Function to install 1Password Connect
install_1password() {
  echo "Installing/upgrading 1Password Connect..."
  helm upgrade --install connect 1password/connect \
    --namespace 1password \
    --set-file "connect.credentials=$CREDENTIALS_PATH" \
    --set operator.create=true \
    --set "operator.token.value=${OP_CONNECT_TOKEN}" \
    --set "operator.watchNamespace={$WATCH_NAMESPACES}" \
    -f "${INFRA_DIR}/1password/values.yaml"
}

# Function to setup certificates
setup_certificates() {
  echo "Setting up certificates..."
  # Apply Gel certificates
  if [ -f "${INFRA_DIR}/databases/gel/certificate.yaml" ]; then
    echo "Applying Gel certificates..."
    kubectl apply -f "${INFRA_DIR}/databases/gel/certificate.yaml"

    # Add a small wait for the secret to potentially be created by cert-manager
    echo "Waiting briefly for gel-ca secret to be created..."
    sleep 10 
  else
    echo "Warning: Gel certificate file not found at ${INFRA_DIR}/databases/gel/certificate.yaml"
  fi
}

# Function to copy the gel-ca secret to the cert-manager namespace
copy_gel_ca_to_cert_manager() {
  echo "Copying gel-ca secret from 'gel' to 'cert-manager' namespace..."
  # Check if the source secret exists
  if kubectl get secret gel-ca -n gel > /dev/null 2>&1; then
    # Get the secret, change namespace, remove resourceVersion/uid, and apply
    kubectl get secret gel-ca -n gel -o json | \
      jq 'del(.metadata.resourceVersion, .metadata.uid, .metadata.creationTimestamp, .metadata.annotations) | .metadata.namespace="cert-manager"' | \
      kubectl apply -f -
  else
    echo "Warning: Source secret 'gel-ca' not found in namespace 'gel'. Skipping copy."
  fi
}

# Function to setup the cert-manager trust Bundle
setup_trust_bundle() {
  echo "Setting up cert-manager trust Bundle..."
  if [ -f "${INFRA_DIR}/certs/trust-bundle.yaml" ]; then
    kubectl apply -f "${INFRA_DIR}/certs/trust-bundle.yaml"
  else
    echo "Warning: Trust bundle file not found at ${INFRA_DIR}/certs/trust-bundle.yaml"
  fi
}

# Function to setup RBAC for cross-namespace secret access
setup_cross_namespace_rbac() {
  echo "Setting up RBAC for cross-namespace secret access (ignis -> gel)..."

  # Define the Role in the 'gel' namespace
  cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: gel-secrets-reader
  namespace: gel
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["gel-server-password", "gel-ca"] # Specific secrets anvil needs
  verbs: ["get"]
EOF

  # Define the RoleBinding in the 'gel' namespace
  cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-gel-secrets-for-anvil
  namespace: gel
subjects:
- kind: ServiceAccount
  name: default # Assuming anvil uses the default SA in the ignis namespace
  namespace: ignis
roleRef:
  kind: Role
  name: gel-secrets-reader # Name of the Role defined above
  apiGroup: rbac.authorization.k8s.io
EOF
}

# Function to verify installations
verify_installations() {
  echo "Waiting for 1Password Connect pods to be ready..."
  kubectl wait --for=condition=ready pod -l app=onepassword-connect -n 1password --timeout=120s ||
    true

  echo "Checking 1Password Connect pod status..."
  kubectl get pods -n 1password

  echo "Verifying RBAC permissions..."
  for ns in "${NAMESPACES[@]}"; do
    if [ "$ns" != "1password" ]; then
      kubectl auth can-i --as=system:serviceaccount:1password:onepassword-connect-operator -n "$ns" get onepassworditems
    fi
  done

  echo "Checking CloudNative PostgreSQL operator status..."
  kubectl get pods -n cnpg-system

  echo "Checking cert-manager status..."
  kubectl get pods -n cert-manager

  echo "Checking Metrics Server status..."
  kubectl get pods -n kube-system -l k8s-app=metrics-server
}

# Main installation process
echo "Starting installation process..."
add_helm_repos
create_namespaces
cleanup_rbac
install_cert_manager
install_metrics_server 
install_cnpg
install_1password
setup_certificates
copy_gel_ca_to_cert_manager
setup_trust_bundle
setup_cross_namespace_rbac
verify_installations

# Trust certificates if requested
if [ "$TRUST_CERTS" = true ]; then
  echo "Setting up certificate trust..."
  "${SCRIPT_DIR}/trust-certs.sh"
fi

echo "Installation completed successfully!"
