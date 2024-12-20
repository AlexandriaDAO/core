#!/bin/bash
set -x 

echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

# (Re)Start dfx
dfx stop
dfx start --background --clean
cp dfx_mainnet.json dfx.json
# If mops or npm packages are inaccessible: export PATH="/home/<your-username>/.npm-global/bin:$PATH"

# Step 1: Deploy NFT Stuff

dfx canister create icrc7 --specified-id 53ewn-qqaaa-aaaap-qkmqq-cai
dfx build icrc7
dfx canister update-settings icrc7 --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai --network ic

dfx canister create icrc7_scion --specified-id uxyan-oyaaa-aaaap-qhezq-cai
dfx build icrc7_scion
dfx canister update-settings icrc7_scion --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai --network ic

cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

dfx deploy nft_manager --network ic

# Step 2: Deploy backend logic canisters.

# For alex_backend
cargo build --release --target wasm32-unknown-unknown --package alex_backend
candid-extractor target/wasm32-unknown-unknown/release/alex_backend.wasm > src/alex_backend/alex_backend.did
# For user
cargo build --release --target wasm32-unknown-unknown --package user
candid-extractor target/wasm32-unknown-unknown/release/user.wasm > src/user/user.did
# For bookmarks
cargo build --release --target wasm32-unknown-unknown --package bookmarks
candid-extractor target/wasm32-unknown-unknown/release/bookmarks.wasm > src/bookmarks/bookmarks.did
# For icp_swap
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
# For vetkd
cargo build --release --target wasm32-unknown-unknown --package vetkd
candid-extractor target/wasm32-unknown-unknown/release/vetkd.wasm > src/vetkd/vetkd.did
# for tests
cargo build --release --target wasm32-unknown-unknown --package tests
candid-extractor target/wasm32-unknown-unknown/release/tests.wasm > src/tests/tests.did
# For Emporium
cargo build --release --target wasm32-unknown-unknown --package emporium
candid-extractor target/wasm32-unknown-unknown/release/emporium.wasm > src/emporium/emporium.did



dfx deploy alex_backend --network ic
dfx deploy user --network ic
dfx deploy bookmarks --network ic
dfx deploy icp_swap --network ic
dfx deploy system_api --network ic
dfx deploy tokenomics --network ic
dfx deploy vetkd --network ic
dfx deploy tests --network ic
dfx deploy emporium --network ic

# The one azle canister:
dfx deploy alex_wallet --network ic

# Step 3: Deploy FTs (ALEX & LBRY).

# dfx deploy LBRY --network ic --argument '(variant { Init = 
# record {
#      token_symbol = "LBRY";
#      token_name = "LBRY";
#      minting_account = record { owner = principal "'$(dfx canister id icp_swap --network ic)'" };
#      transfer_fee = 4_000_000;
#      metadata = vec {};
#      initial_balances = vec {};
#      archive_options = record {
#          num_blocks_to_archive = 1000;
#          trigger_threshold = 2000;
#          controller_id = principal "'$(dfx canister id icp_swap --network ic)'";
#      };
#      feature_flags = opt record {
#         icrc2 = true;
#         icrc3 = true;
#      };
#  }
# })'


# dfx deploy ALEX --network ic --argument '(variant { Init = 
# record {
#      token_symbol = "ALEX";
#      token_name = "ALEX";
#      minting_account = record { owner = principal "'$(dfx canister id tokenomics --network ic)'" };
#      transfer_fee = 10_000;
#      metadata = vec {};
#      initial_balances = vec {};
#      archive_options = record {
#          num_blocks_to_archive = 1000;
#          trigger_threshold = 2000;
#          controller_id = principal "'$(dfx canister id tokenomics --network ic)'";
#      };
#      feature_flags = opt record {
#         icrc2 = true;
#         icrc3 = true;
#      };
#  }
# })'


# # Exit and deploy frontend manually.
# echo "Backend canisters finished. Copy and paste remainder of the build script manually to deploy on the network."
# exit 1

# # You may need to run these manually based on sytem level access controls.
cd ./.dfx/
rm -rf local/canisters/
cp -r ic/canisters/ local/
cd ..

# cp .dfx/ic/canisters/alex_frontend/assetstorage.did .dfx/local/canisters/alex_frontend/
mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
mkdir -p .dfx/local/canisters/alex_frontend/

wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/ALEX/ALEX.did
wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/LBRY/LBRY.did

npm i
dfx deploy alex_frontend --network ic
