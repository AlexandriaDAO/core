# Install Docker Engine instructions
# https://docs.docker.com/engine/install/ubuntu/

FROM ubuntu:24.04

ENV NVM_DIR=/root/.nvm
ENV NVM_VERSION=v0.40.0
ENV NODE_VERSION=20.18.0

ENV RUSTUP_HOME=/opt/rustup
ENV CARGO_HOME=/opt/cargo
ENV RUST_VERSION=1.80.1

ENV DFX_VERSION=0.24.0

# Install the basic environment needed for our build tools.
RUN apt -yq update
RUN apt -yqq install --no-install-recommends curl wget tar ca-certificates build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang git openssh-client libunwind-dev cmake rsync \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js using nvm
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin:${PATH}"
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash
RUN . "${NVM_DIR}/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm alias default v${NODE_VERSION}

# Install Rust and Cargo
ENV PATH=/opt/cargo/bin:${PATH}
RUN curl --fail https://sh.rustup.rs -sSf \
    | sh -s -- -y --default-toolchain ${RUST_VERSION}-x86_64-unknown-linux-gnu --no-modify-path && \
    rustup default ${RUST_VERSION}-x86_64-unknown-linux-gnu && \
    rustup target add wasm32-unknown-unknown &&\
    cargo install ic-wasm && \
    cargo install candid-extractor

# Install dfx
RUN wget -O dfx.tar.gz "https://github.com/dfinity/sdk/releases/download/${DFX_VERSION}/dfx-${DFX_VERSION}-x86_64-linux.tar.gz" && \
    tar -xzf dfx.tar.gz -C /usr/local/bin && \
    rm dfx.tar.gz

# Verify dfx installation
RUN dfx --version

# Install ic-mops
RUN npm i -g ic-mops

# Install dfx extension for azle
RUN npx azle install-dfx-extension


# RUN cd /home
# RUN git clone git@github.com:AlexandriaDAO/core.git
# # RUN git clone https://github.com/AlexandriaDAO/core.git
# RUN cd core
# RUN git checkout master

# Set up working directory
WORKDIR /home/ugd

# # Copy your project files
COPY . .


# git status
# fatal: detected dubious ownership in repository at '/home/core'
# To add an exception for this directory, call:

# 	git config --global --add safe.directory /home/core

# Expose ports for dfx and npm
EXPOSE 8080 4943

# # Set up the entrypoint
# ENTRYPOINT ["/bin/bash", "scripts/build.sh"]





# list images
# sudo docker images

# remove image
# sudo docker rmi ugd_image:latest

# check images and remove unnecessary ones
# sudo docker image prune -a

# free up build cache, if disk space is a concern
# sudo docker builder prune

# list running containers
# sudo docker ps

# list all containers
# sudo docker ps -a

# remove container
# sudo docker rm ugd_container

# run interactive container with host network ports mapping
# not recommended to use --network host as it may cause conflicts with host's network stack
# sudo docker run --network host -it --name ugd_container ugd_image:latest

# instead use this
# sudo docker run -p 8080:8080 -p 4943:4943 ugd_image:latest

# start dfx inside container
# dfx start --background

# this would start the dfx on 127.0.0.1:4943 which is not accessible from the host
# to access the dfx from the host, we need to bind the listening address to 0.0.0.0 like so
# dfx start --host 0.0.0.0:4943 --background
# now it should be accessible in browser like so http://127.0.0.1:4943 or http://localhost:4943/


# run container with directory mounted
# sudo docker run -v /home/zee/work/wsl/ugd:/home/ugd -p 8080:8080 -p 4943:4943 -it --name ugd_container ugd_image:latest
