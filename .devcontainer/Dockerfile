FROM oven/bun:1

# build-essential/pkg-config/libssl-dev: mine's native deps (sentry -> openssl)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git xz-utils build-essential pkg-config libssl-dev \
  && rm -rf /var/lib/apt/lists/*

# Gel CLI, taken from the same image used in prod
COPY --from=geldata/gel:nightly_8-dev9812_cv202511030000 /usr/bin/gel /usr/local/bin/gel
# The `gel` npm package's bin wrapper (which shadows the CLI in bun scripts) never finds it on PATH,
# so point its download cache at the real CLI instead of letting it fetch one
RUN mkdir -p /root/.cache/gel/bin && ln -s /usr/local/bin/gel /root/.cache/gel/bin/gel

# 1Password CLI, for the `op run` that wraps forge's and mine's dev scripts
COPY --from=1password/op:2 /usr/local/bin/op /usr/local/bin/op
# op refuses a config dir that isn't 700; a new named volume mounted here inherits this mode
RUN mkdir -p /root/.config/op && chmod 700 /root/.config/op

# uv fetches the Python that patch_edgeql_js.py asks for on first run
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh

# Rust + cargo-watch for mine's dev script. Default rustup locations, since turbo's strict env mode
# would strip RUSTUP_HOME/CARGO_HOME from tasks (PATH is always passed through)
ENV PATH=/root/.cargo/bin:$PATH
RUN curl --proto '=https' -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --no-modify-path \
  && curl -LsSf https://github.com/watchexec/cargo-watch/releases/download/v8.5.3/cargo-watch-v8.5.3-x86_64-unknown-linux-gnu.tar.xz \
    | tar -xJ --strip-components=1 -C /root/.cargo/bin cargo-watch-v8.5.3-x86_64-unknown-linux-gnu/cargo-watch
