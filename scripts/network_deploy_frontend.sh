#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project root directory (assuming scripts is one level below root)
cd "$SCRIPT_DIR/.." || exit 1

# Ensure build.sh is executable
chmod +x "$SCRIPT_DIR/build.sh"

# # This step fixes azle type errors.
# rm -rf node_modules
# rm -rf .dfx
# npm cache clean --force
# npm install

# Run build.sh with its full path
"$SCRIPT_DIR/build.sh"


cp dfx_mainnet.json dfx.json

cd ./.dfx/
rm -rf local/canisters/
cp -r ic/canisters/ local/
cd ..

# # [optional]Take a snapshot
# dfx canister stop alex_frontend --network ic
# dfx canister snapshot create alex_frontend --network ic
# dfx canister start alex_frontend --network ic

dfx deploy alex_frontend --network ic
