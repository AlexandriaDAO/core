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


mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
mkdir -p .dfx/local/canisters/alex_frontend/

wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/ALEX/ALEX.did
wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/LBRY/LBRY.did

# # [optional]Take a snapshot
# dfx canister stop alex_frontend --network ic
# dfx canister snapshot create alex_frontend --network ic
# dfx canister start alex_frontend --network ic

dfx deploy alex_frontend --network ic