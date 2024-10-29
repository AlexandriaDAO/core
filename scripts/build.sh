# EVAN VERSION OG

set -x 

# Make mops accessible:
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

#!/bin/bash
cp dfx_local.json dfx.json

# # Step 1: Start dfx
dfx stop
dfx start --background --clean

# Step 2: II Canister
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity
dfx deploy xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai

# Step 3: Deploy nft_manager, which deploys icrc7

dfx canister create icrc7 --specified-id fjqb7-6qaaa-aaaak-qc7gq-cai
dfx build icrc7
dfx canister update-settings icrc7 --add-controller forhl-tiaaa-aaaak-qc7ga-cai

cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

dfx deploy nft_manager --specified-id forhl-tiaaa-aaaak-qc7ga-cai

# Step 4: Generate all other backend canisters.

# For alex_backend
cargo build --release --target wasm32-unknown-unknown --package alex_backend
candid-extractor target/wasm32-unknown-unknown/release/alex_backend.wasm > src/alex_backend/alex_backend.did
# For bookmarks
cargo build --release --target wasm32-unknown-unknown --package bookmarks
candid-extractor target/wasm32-unknown-unknown/release/bookmarks.wasm > src/bookmarks/bookmarks.did
# For icp_swap
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
# For registry
cargo build --release --target wasm32-unknown-unknown --package registry
candid-extractor target/wasm32-unknown-unknown/release/registry.wasm > src/registry/registry.did
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did

# for alex_librarian
cargo build --release --target wasm32-unknown-unknown --package alex_librarian
candid-extractor target/wasm32-unknown-unknown/release/alex_librarian.wasm > src/alex_librarian/alex_librarian.did
# for vetkd
cargo build --release --target wasm32-unknown-unknown --package vetkd
candid-extractor target/wasm32-unknown-unknown/release/vetkd.wasm > src/vetkd/vetkd.did


cargo update

dfx deploy bookmarks --specified-id sklez-7aaaa-aaaan-qlrva-cai
dfx deploy alex_backend --specified-id xj2l7-vyaaa-aaaap-abl4a-cai
dfx deploy icp_swap --specified-id 5qx27-tyaaa-aaaal-qjafa-cai
dfx deploy registry --specified-id uxyan-oyaaa-aaaap-qhezq-cai
dfx deploy tokenomics --specified-id chddw-rqaaa-aaaao-qevqq-cai

dfx deploy alex_librarian --specified-id rby3s-dqaaa-aaaak-qizqa-cai
dfx deploy vetkd --specified-id fzemm-saaaa-aaaan-qlsla-cai
dfx deploy system_api --specified-id xhfe4-aqaaa-aaaak-akv4q-cai

dfx deploy alex_wallet --specified-id ju4sh-3yaaa-aaaap-ahapa-cai


# Step 5: Configure Local Identities for token launches
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)


# Step 6: Deploy the ICP & ICRC Ledger with LICP, LBRY, and ALEX tokens
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "  
  (variant {  
    Init = record {  
      minting_account = \"$MINTER_ACCOUNT_ID\";  
      initial_values = vec {  
        record {  
          \"$DEFAULT_ACCOUNT_ID\";  
          record {  
            e8s = 8_681_981_000_000_000 : nat64;  
          };  
        };  
      };  
      send_whitelist = vec {};  
      transfer_fee = opt record {  
        e8s = 10_000 : nat64;  
      };  
      token_symbol = opt \"LICP\";  
      token_name = opt \"Local ICP\";  
    }  
  })  
"

dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '(variant { Init = 
record {
     token_symbol = "LBRY";
     token_name = "LBRY";
     minting_account = record { owner = principal "'$(dfx canister id icp_swap)'" };
     transfer_fee = 4_000_000;
     metadata = vec {};
     initial_balances = vec {};
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'$(dfx canister id icp_swap)'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'




dfx deploy ALEX --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '(variant { Init = 
record {
     token_symbol = "ALEX";
     token_name = "ALEX";
     minting_account = record { owner = principal "'$(dfx canister id tokenomics)'" };
     transfer_fee = 10_000;
     metadata = vec {};
     initial_balances = vec {};
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'$(dfx canister id tokenomics)'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'


# echo "Backend canisters finished. Copy and paste remainder of the build script manually to deploy on the network."
# exit 1

# Step 7: Deploy frontend Manually.

mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
touch .dfx/local/canisters/LBRY/LBRY.did
touch .dfx/local/canisters/ALEX/ALEX.did

npm i
# dfx deploy alex_frontend --specified-id xo3nl-yaaaa-aaaap-abl4q-cai

## Helpful extras for testing.
# dfx ledger balance
# dfx ledger transfer <to_account> --icp <amount> --memo 0
# dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal <principal>)

# # Load canister IDs from canister_ids.json
# ALEX_CANISTER_ID=$(jq -r '.ALEX.ic' canister_ids.json)
# LBRY_CANISTER_ID=$(jq -r '.LBRY.ic' canister_ids.json)
# TOKENOMICS_CANISTER_ID=$(jq -r '.tokenomics.ic' canister_ids.json)
# XRC_CANISTER_ID=$(jq -r '.xrc.ic' canister_ids.json)

# # Export canister IDs as environment variables
# export ALEX_CANISTER_ID
# export LBRY_CANISTER_ID
# export TOKENOMICS_CANISTER_ID
# export XRC_CANISTER_ID
