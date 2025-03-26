# EVAN VERSION OG

set -x 

# Make mops accessible:
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

#!/bin/bash
cp dfx_local.json dfx.json

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

# Step 4: Generate all other backend canisters.

# For alex_backend
cargo build --release --target wasm32-unknown-unknown --package alex_backend
candid-extractor target/wasm32-unknown-unknown/release/alex_backend.wasm > src/alex_backend/alex_backend.did
dfx deploy alex_backend --specified-id y42qn-baaaa-aaaap-qkmnq-cai
# For perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
# For icp_swap
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
dfx deploy icp_swap --specified-id 54fqz-5iaaa-aaaap-qkmqa-cai
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
dfx deploy tokenomics --specified-id 5abki-kiaaa-aaaap-qkmsa-cai

# for user
cargo build --release --target wasm32-unknown-unknown --package user
candid-extractor target/wasm32-unknown-unknown/release/user.wasm > src/user/user.did
dfx deploy user --specified-id yo4hu-nqaaa-aaaap-qkmoq-cai

# for alex_wallet
cargo build --release --target wasm32-unknown-unknown --package alex_wallet
candid-extractor target/wasm32-unknown-unknown/release/alex_wallet.wasm > src/alex_wallet/alex_wallet.did
dfx deploy alex_wallet --specified-id "yh7mi-3yaaa-aaaap-qkmpa-cai";

# for vetkd
cargo build --release --target wasm32-unknown-unknown --package vetkd
candid-extractor target/wasm32-unknown-unknown/release/vetkd.wasm > src/vetkd/vetkd.did
dfx deploy vetkd --specified-id 5ham4-hqaaa-aaaap-qkmsq-cai
# For Emporium
cargo build --release --target wasm32-unknown-unknown --package emporium
candid-extractor target/wasm32-unknown-unknown/release/emporium.wasm > src/emporium/emporium.did
dfx deploy emporium --specified-id zdcg2-dqaaa-aaaap-qpnha-cai
# For Logs
cargo build --release --target wasm32-unknown-unknown --package logs
candid-extractor target/wasm32-unknown-unknown/release/logs.wasm > src/logs/logs.did
dfx deploy logs --specified-id yn33w-uaaaa-aaaap-qpk5q-cai

# For Asset Manager canister
cargo build --release --target wasm32-unknown-unknown --package asset_manager
candid-extractor target/wasm32-unknown-unknown/release/asset_manager.wasm > src/asset_manager/asset_manager.did
dfx deploy asset_manager --specified-id zhcno-qqaaa-aaaap-qpv7a-cai


dfx ledger fabricate-cycles --canister zhcno-qqaaa-aaaap-qpv7a-cai --cycles 10000000000000000



cargo update


dfx deploy system_api --specified-id 5vg3f-laaaa-aaaap-qkmrq-cai

dfx deploy alex_wallet --specified-id yh7mi-3yaaa-aaaap-qkmpa-cai


dfx deploy asset_manager --specified-id aax3a-h4aaa-aaaaa-qaahq-cai


# Step 5: Configure Local Identities for token launches
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx identity use user_1
export ALICE_ACCOUNT_ID=$(dfx ledger account-id)
export ALICE_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_2
export BOB_ACCOUNT_ID=$(dfx ledger account-id)
export BOB_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_3
export CHARLIE_ACCOUNT_ID=$(dfx ledger account-id)
export CHARLIE_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)




# Step 6: Deploy the ICP & ICRC Ledger with LICP, LBRYs, and ALEX tokens
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
          \"$ALICE_ACCOUNT_ID\";  
          record {  
            e8s = 1_000_000_000 : nat64;  
          };
          \"$BOB_ACCOUNT_ID\";
          record {
            e8s = 1_000_000_000 : nat64;
          };
          \"$CHARLIE_ACCOUNT_ID\";
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


dfx deploy ALEX --specified-id ysy5f-2qaaa-aaaap-qkmmq-cai --argument '(variant { Init = 
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


# create and deploy sign in with ethereum provider
dfx canister create ic_siwe_provider --specified-id w4vlu-paaaa-aaaaj-azxyq-cai

# opt 300000000000; /* 5 minutes */
# opt 604800000000000; /* 1 week */
dfx deploy ic_siwe_provider --argument $'(
    record {
        domain = "127.0.0.1";
        uri = "http://127.0.0.1:4943";
        salt = "secretsalt000";
        chain_id = opt 1;
        scheme = opt "http";
        statement = opt "Login to the Alexandria";
        sign_in_expires_in = opt 300000000000;
        session_expires_in = opt 604800000000000;
        targets = opt vec {
            "'$(dfx canister id ic_siwe_provider)'";
            "'$(dfx canister id nft_manager)'";
            "'$(dfx canister id user)'";
        };
    }
)'

# create and deploy sign in with solana provider
dfx canister create ic_siws_provider --specified-id w3una-cyaaa-aaaaj-azxya-cai
dfx deploy ic_siws_provider --argument $'(
    record {
        domain = "127.0.0.1";
        uri = "http://127.0.0.1:4943";
        salt = "secretsalt000";
        chain_id = opt "mainnet";
        scheme = opt "http";
        statement = opt "Login to the Alexandria";
        sign_in_expires_in = opt 300000000000;
        session_expires_in = opt 604800000000000;
        targets = opt vec {
            "'$(dfx canister id ic_siws_provider)'";
            "'$(dfx canister id nft_manager)'";
            "'$(dfx canister id user)'";
        };
    }
)'


# echo "Backend canisters finished. Copy and paste remainder of the build script manually to deploy on the network."
# exit 1

# Step 7: Deploy frontend ManuallyS.

mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX
touch .dfx/local/canisters/LBRY/LBRY.did
touch .dfx/local/canisters/ALEX/ALEX.did

# For icp_swap_factory
mkdir -p src/icp_swap_factory && dfx canister --network ic metadata ggzvv-5qaaa-aaaag-qck7a-cai candid:service > src/icp_swap_factory/icp_swap_factory.did


npm i
dfx deploy alex_frontend --specified-id yj5ba-aiaaa-aaaap-qkmoa-cai

## Helpful extras for testing.
# dfx ledger balance
# dfx ledger transfer <to_account> --icp <amount> --memo 0
# dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal yvjik-zehkk-qo7nr-t4r7a-2aomx-mnp6e-htymf-r2adf-d7gjm-bpu3e-aae)

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
