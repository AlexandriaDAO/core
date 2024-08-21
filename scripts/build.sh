# EVAN VERSION OG

set -x 

#!/bin/bash
cp dfx_local.json dfx.json

# Step 1: Start dfx
dfx stop
dfx start --background --clean

# Step 2: II Canister
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity

# Step 3: Deploy nft_manager, which deploys icrc7

dfx canister create icrc7 --specified-id fjqb7-6qaaa-aaaak-qc7gq-cai
cargo build --package icrc7 --target wasm32-unknown-unknown

cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

dfx deploy nft_manager --specified-id forhl-tiaaa-aaaak-qc7ga-cai
dfx canister update-settings icrc7 --add-controller forhl-tiaaa-aaaak-qc7ga-cai

dfx canister call nft_manager deploy_icrc7
dfx canister call nft_manager initialize_icrc7

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
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did

cargo update

dfx deploy alex_backend --specified-id xj2l7-vyaaa-aaaap-abl4a-cai
dfx deploy bookmarks --specified-id sklez-7aaaa-aaaan-qlrva-cai
dfx deploy icp_swap --specified-id 5qx27-tyaaa-aaaal-qjafa-cai
dfx deploy tokenomics --specified-id uxyan-oyaaa-aaaap-qhezq-cai



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
            e8s = 10_000_000_000 : nat64;  
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


dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '
  (variant {
    Init = record {
      token_name = "LBRYs";
      token_symbol = "LBRY";
      minting_account = record {
        owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
          };
          100_000_000_000;
        };
      };
      metadata = vec {};
      transfer_fee = 4_000_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
'

dfx deploy ALEX --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '
  (variant {
    Init = record {
      token_name = "Alexandria";
      token_symbol = "ALEX";
      minting_account = record {
        owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
          };
          100_000_000_000;
        };
      };
      metadata = vec {};
      transfer_fee = 10_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
'


echo "Backend canisters finished. Copy and paste remainder of the build script manually to deploy on the network."
exit 1

# Step 7: Deploy frontend Manually.

mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
touch .dfx/local/canisters/LBRY/LBRY.did
touch .dfx/local/canisters/ALEX/ALEX.did

# mkdir -p .dfx/local/canisters/icp_ledger_canister
# curl https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icp_ledger/ledger.did -o .dfx/local/canisters/icp_ledger_canister/icp_ledger_canister.did

npm i
dfx deploy alex_frontend --specified-id xo3nl-yaaaa-aaaap-abl4q-cai