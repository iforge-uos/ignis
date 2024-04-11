#!/bin/bash

# Define names for the images
ANVIL_IMAGE_NAME="anvil"
FORGE_IMAGE_NAME="forge"

# Define operation mode: build or load
OPERATION_MODE=${1:-"build"}

# Customizable directory for tar files
# Pass the directory as the second argument to this script, defaulting to "./deploy/container-images" if not provided
TAR_DIR=${2:-"./deploy/container-images"}

# Ensure the tar directory exists when building
[ "$OPERATION_MODE" == "build" ] && mkdir -p "$TAR_DIR"



build_images() {
    # Build the Anvil Docker image
    echo "Building Anvil Docker image..."
    docker build --target anvil -t $ANVIL_IMAGE_NAME .

    # Build the Forge Docker image
    echo "Building Forge Docker image..."
    docker build --target forge -t $FORGE_IMAGE_NAME .

    # Saving Anvil Docker image to a tar file
    ANVIL_TAR_PATH="$TAR_DIR/$ANVIL_IMAGE_NAME.tar"
    echo "Saving Anvil Docker image to $ANVIL_TAR_PATH..."
    docker save $ANVIL_IMAGE_NAME > "$ANVIL_TAR_PATH"

    # Saving Forge Docker image to a tar file
    FORGE_TAR_PATH="$TAR_DIR/$FORGE_IMAGE_NAME.tar"
    echo "Saving Forge Docker image to $FORGE_TAR_PATH..."
    docker save $FORGE_IMAGE_NAME > "$FORGE_TAR_PATH"

    echo "Build and save process completed."
}

load_images() {
    # Loading Anvil Docker image from a tar file
    ANVIL_TAR_PATH="$TAR_DIR/$ANVIL_IMAGE_NAME.tar"
    if [ -f "$ANVIL_TAR_PATH" ]; then
        echo "Loading Anvil Docker image from $ANVIL_TAR_PATH..."
        docker load < "$ANVIL_TAR_PATH"
    else
        echo "Anvil tar file does not exist: $ANVIL_TAR_PATH"
    fi

    # Loading Forge Docker image from a tar file
    FORGE_TAR_PATH="$TAR_DIR/$FORGE_IMAGE_NAME.tar"
    if [ -f "$FORGE_TAR_PATH" ]; then
        echo "Loading Forge Docker image from $FORGE_TAR_PATH..."
        docker load < "$FORGE_TAR_PATH"
    else
        echo "Forge tar file does not exist: $FORGE_TAR_PATH"
    fi

    echo "Load process completed."
}

case "$OPERATION_MODE" in
    build)
        build_images
        ;;
    load)
        load_images
        ;;
    *)
        echo "Invalid operation mode: $OPERATION_MODE. Please use 'build' or 'load'."
        exit 1
        ;;
esac
