#!/bin/bash

cp dfx_mainnet.json dfx.json

cd ./.dfx/
rm -rf local/canisters/
cp -r ic/canisters/ local/
cd ..

mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
mkdir -p .dfx/local/canisters/alex_frontend/
mkdir -p src/icp_swap_factory && dfx canister --network ic metadata ggzvv-5qaaa-aaaag-qck7a-cai candid:service > src/icp_swap_factory/icp_swap_factory.did

wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/ALEX/ALEX.did
wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/LBRY/LBRY.did


dfx identity use alex

# Build the frontend (will use .env.production automatically)
npm run build

# Deploy to IC
dfx deploy alex_frontend --network ic