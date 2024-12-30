#!/bin/bash
set -x

# Ensure script is run from project root
if [ ! -d "src/tests" ] || [ ! -d "src/icp_swap" ]; then
    echo "Error: This script must be run from the project root directory"
    exit 1
fi

# # Step 1: Start dfx
# kill -9 $(lsof -t -i:4943)
dfx stop
dfx start --background --clean


# Step 2: II Canister
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity


## xrc first because it's used in init functions of others.
dfx canister create xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai
cargo build --release --target wasm32-unknown-unknown --package xrc
candid-extractor target/wasm32-unknown-unknown/release/xrc.wasm > src/xrc/xrc.did
dfx deploy xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai

# Step 3: Deploy nft_manager, which deploys icrc7
dfx canister create icrc7 --specified-id 53ewn-qqaaa-aaaap-qkmqq-cai
dfx build icrc7
dfx canister update-settings icrc7 --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai

dfx canister create icrc7_scion --specified-id uxyan-oyaaa-aaaap-qhezq-cai
dfx build icrc7_scion
dfx canister update-settings icrc7_scion --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai

cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

dfx deploy nft_manager --specified-id 5sh5r-gyaaa-aaaap-qkmra-cai

# Step 5: Configure Local Identities for token launches
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)


# # Step 6: Deploy the ICP & ICRC Ledger with LICP, LBRY, and ALEX tokens
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
        record {
          \"7ae46f4683825e60e72a330cbf750fa4626ebab39fdef11780b8eb671e4dd3ea\";
          record {
            e8s = 10_000_000_000  : nat64;
          };
        };
        record {  
          \"f7520954c68e2b1f4ea36b185ffaf28f81bfea9635e869857cb046db9051493d\";  
          record {  
            e8s = 1_000_000_000 : nat64;  
          };
        };
        record {
          \"ed67eb266efc6821fdfb308a250aaff760856d3dbbf22e0532bb825d1042b849\";
          record {
            e8s = 1_000_000_000 : nat64;
          };
        };
        record {
          \"bd94c1255016d7aca0028a3f29ffb546a7f8131962d5ea2a629e4fe99ebebcad\";
          record {
            e8s = 1_000_000_000 : nat64;
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


dfx deploy LBRY --specified-id y33wz-myaaa-aaaap-qkmna-cai --argument '(variant { Init = 
record {
     token_symbol = "LBRY";
     token_name = "LBRY";
     minting_account = record { owner = principal "'54fqz-5iaaa-aaaap-qkmqa-cai'" };
     transfer_fee = 4_000_000;
     metadata = vec {};
     initial_balances = vec {};
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'54fqz-5iaaa-aaaap-qkmqa-cai'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'




dfx deploy ALEX --specified-id ysy5f-2qaaa-aaaap-qkmmq-cai --argument '(variant { Init = 
record {
     token_symbol = "ALEX";
     token_name = "ALEX";
     minting_account = record { owner = principal "'5abki-kiaaa-aaaap-qkmsa-cai'" };
     transfer_fee = 10_000;
     metadata = vec {};
     initial_balances = vec {};
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'5abki-kiaaa-aaaap-qkmsa-cai'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'


# For icp_swap
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
# for logs
cargo build --release --target wasm32-unknown-unknown --package logs
candid-extractor target/wasm32-unknown-unknown/release/logs.wasm > src/logs/logs.did

dfx deploy icp_swap --specified-id 54fqz-5iaaa-aaaap-qkmqa-cai
dfx deploy tokenomics --specified-id 5abki-kiaaa-aaaap-qkmsa-cai
dfx deploy logs --specified-id yn33w-uaaaa-aaaap-qpk5q-cai




