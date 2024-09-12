# Start with Ubuntu as the base image
FROM ubuntu:22.04

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Avoid prompts from apt and install basic tools and dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    curl ca-certificates build-essential pkg-config libssl-dev \
    git jq vim \
    nodejs npm \
    wget gzip \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set up environment variables
ENV HOME /home/core
ENV WDIR ${HOME}
WORKDIR ${WDIR}

# Set up locale
RUN apt-get update && apt-get install -y locales \
    && locale-gen en_US.UTF-8 \
    && echo "export LANG=en_US.UTF-8 LANGUAGE=en_US.en LC_ALL=en_US.UTF-8" >> ${HOME}/.bashrc \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
ARG RUST_VERSION=1.77.2
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH
RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --default-toolchain "${RUST_VERSION}-x86_64-unknown-linux-gnu" --no-modify-path && \
    rustup default "${RUST_VERSION}-x86_64-unknown-linux-gnu" && \
    rustup target add wasm32-unknown-unknown

# Install yq for YAML processing
ARG YQ_VERSION=v4.34.1
RUN curl \
    --location \
    https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_386 \
    --output /usr/bin/yq \
    && chmod +x /usr/bin/yq

# Copy the project files into the container
COPY . ${WDIR}

# Create bin directory
RUN mkdir -p ${HOME}/bin

# Copy install.sh, constants.sh, and .env
COPY install.sh constants.sh .env ./

# Run the install script
RUN chmod +x ./install.sh && ./install.sh
ENV PATH=${HOME}/bin:$PATH

# Install NVM and Node LTS
ENV NVM_DIR=${HOME}/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install --lts \
    && nvm use --lts
ENV PATH="${HOME}/.nvm/versions/node/$(ls ${HOME}/.nvm/versions/node)/bin:${PATH}"

# Install ic-mops
RUN npm i -g ic-mops

# Install Azle DFX extension
RUN npx azle install-dfx-extension

# Set up DFX configuration
RUN mkdir -p ${HOME}/.config/dfx
RUN echo '{ \n\
  "local": { \n\
    "bind": "0.0.0.0:8080", \n\
    "type": "ephemeral", \n\
    "replica": { \n\
      "subnet_type": "system", \n\
      "port": 8000 \n\
    } \n\
  } \n\
}' > ${HOME}/.config/dfx/networks.json

# Install project dependencies
RUN npm install

# Make the build script executable
RUN chmod +x ./scripts/build.sh

# Expose the ports your project uses
EXPOSE 8000 8080

# Command to run your build script
CMD ["/bin/bash", "-c", "./scripts/build.sh"]