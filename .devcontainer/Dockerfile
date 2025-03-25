FROM mcr.microsoft.com/devcontainers/typescript-node:22-bullseye

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    unzip \
    pkg-config \
    libssl-dev \
    libpq-dev \
    redis-tools \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create iforge user similar to node user
RUN groupadd iforge \
    && useradd --gid iforge --shell /bin/bash --create-home iforge \
    && echo "iforge ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/iforge \
    && chmod 0440 /etc/sudoers.d/iforge

# Set up npm global directory for iforge
RUN mkdir -p /home/iforge/.npm-global \
    && chown -R iforge:iforge /home/iforge/.npm-global
ENV NPM_CONFIG_PREFIX=/home/iforge/.npm-global
ENV PATH=/home/iforge/.npm-global/bin:${PATH}

# Switch to iforge user
USER iforge
WORKDIR /home/iforge

# Install Rust in separate layer
SHELL ["/bin/bash", "-c"]
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustc --version

# Add Cargo to PATH permanently
ENV PATH="/home/iforge/.cargo/bin:${PATH}"
ENV CARGO_HOME="/home/iforge/.cargo"

# Create necessary directories
RUN mkdir -p /home/iforge/.local/bin

# Install EdgeDB CLI in separate layer
RUN bash -c 'curl --proto '=https' --tlsv1.2 -sSf https://sh.edgedb.com | sh -s -- -y && \
    export PATH="/home/iforge/.local/bin:$PATH" && \
    echo "export PATH=\"/home/iforge/.local/bin:\$PATH\"" >> $HOME/.bashrc && \
    . $HOME/.bashrc && \
    edgedb --version'

# Add EdgeDB to PATH permanently
ENV PATH="/home/iforge/.local/bin:${PATH}"

# Setup pnpm
ENV PNPM_HOME="/home/iforge/.npm-global"
ENV PATH="${PNPM_HOME}:${PATH}"

# Enable corepack (for pnpm) as iforge user
RUN mkdir -p "${PNPM_HOME}" && \
    npm install -g corepack && \
    corepack enable

# Add shell initialization to iforge's bashrc
RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc && \
    echo 'export PATH="/home/iforge/.local/bin:$PATH"' >> $HOME/.bashrc && \
    echo 'export PATH="/home/iforge/.npm-global/bin:$PATH"' >> $HOME/.bashrc && \
    echo 'export PNPM_HOME="/home/iforge/.npm-global"' >> $HOME/.bashrc

# Set the working directory for the project
WORKDIR /workspace
RUN sudo chown iforge:iforge /workspace

# Certificate handling in separate layer
COPY --chown=iforge:iforge .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sudo chmod +x /usr/local/bin/entrypoint.sh

# Verify installations
RUN bash -c 'source $HOME/.bashrc && \
    echo "Checking installations..." && \
    cargo --version && \
    edgedb --version && \
    pnpm --version'

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Use bash as the default shell
SHELL ["/bin/bash", "-c"]
