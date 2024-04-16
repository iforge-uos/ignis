# Use the official Node.js 20 slim image from Docker Hub as the base image
FROM node:20-slim AS base

# Set the environment variable for PNPM home and add it to the PATH
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

# Install corepack to manage Node.js package managers and install Rust and other essential tools
RUN corepack enable && \
    apt-get update && \
    apt-get install -y curl git build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add Rust to the system PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy the local code to the container
COPY . /code

# Set the working directory to the app directory
WORKDIR /code

# Install dependencies using pnpm
RUN pnpm install

# Expose ports (3000, 8000, 4000) used by your application
EXPOSE 3000 8000 4000

# Default command to run when starting the container
CMD ["pnpm", "run", "dev"]
