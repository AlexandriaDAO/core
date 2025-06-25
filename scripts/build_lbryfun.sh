#!/bin/bash
# Minimal build script for lbry_fun testing
# Only deploys essential canisters needed for the 1% distribution

set -e  # Exit on error
set -x  # Print commands

echo "=== Building minimal Alexandria setup for lbry_fun testing ==="

# Navigate to parent Alexandria project
PARENT_PROJECT_PATH=${1:-"../../alexandria"}

if [ ! -d "$PARENT_PROJECT_PATH" ]; then
    echo "Error: Parent Alexandria project not found at $PARENT_PROJECT_PATH"
    echo "Usage: ./build_lbryfun.sh [path_to_alexandria_project]"
    exit 1
fi

cd "$PARENT_PROJECT_PATH"

# Ensure we're using local config
if [ -f "dfx_local.json" ]; then
    cp dfx_local.json dfx.json
fi

# Step 2: Setup identities for testing
echo "=== Setting up test identities ==="
dfx identity use default || dfx identity new default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

# Create test users if they don't exist
for user in minter user_1 user_2 user_3; do
    dfx identity use $user 2>/dev/null || dfx identity new $user --storage-mode plaintext
done

# Get test user account IDs
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)

dfx identity use user_1
export ALICE_ACCOUNT_ID=$(dfx ledger account-id)

dfx identity use user_2
export BOB_ACCOUNT_ID=$(dfx ledger account-id)

dfx identity use user_3
export CHARLIE_ACCOUNT_ID=$(dfx ledger account-id)

dfx identity use default

# Step 3: Deploy ICP Ledger (required for all operations)
echo "=== Deploying ICP Ledger ==="
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "  
  (variant {  
    Init = record {  
      minting_account = \"$MINTER_ACCOUNT_ID\";  
      initial_values = vec {  
        record {  
          \"$DEFAULT_ACCOUNT_ID\";  
          record {  
            e8s = 100_000_000_000_000 : nat64;  
          };  
        };
        record {  
          \"$ALICE_ACCOUNT_ID\";  
          record {  
            e8s = 10_000_000_000_000 : nat64;  
          };
        };
        record {
          \"$BOB_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000_000 : nat64;
          };
        };
        record {
          \"$CHARLIE_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000_000 : nat64;
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

# Step 4: Build and deploy root icp_swap (receives the 1% fee)
echo "=== Building root icp_swap canister ==="
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did || true

echo "=== Deploying root icp_swap canister ==="
dfx deploy icp_swap --specified-id 54fqz-5iaaa-aaaap-qkmqa-cai

# Step 5: Deploy LBRY token (for buyback/burn simulation)
echo "=== Deploying LBRY token ==="
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

# Step 6: Create necessary directories for lbry_fun
echo "=== Creating required directories ==="
mkdir -p .dfx/local/canisters/LBRY
touch .dfx/local/canisters/LBRY/LBRY.did

# Step 7: Deploy XRC (price feed) if needed by lbry_fun
echo "=== Deploying XRC canister ==="
dfx canister create xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai || true
if [ -f "target/wasm32-unknown-unknown/release/xrc.wasm" ]; then
    cargo build --release --target wasm32-unknown-unknown --package xrc
    candid-extractor target/wasm32-unknown-unknown/release/xrc.wasm > src/xrc/xrc.did || true
    dfx deploy xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai
else
    echo "XRC package not found, skipping..."
fi

echo "=== Minimal Alexandria setup complete! ==="
echo ""
echo "Deployed canisters:"
echo "- ICP Ledger: ryjl3-tyaaa-aaaaa-aaaba-cai"
echo "- Root icp_swap: 54fqz-5iaaa-aaaap-qkmqa-cai"
echo "- LBRY Token: y33wz-myaaa-aaaap-qkmna-cai"
echo "- XRC (if available): uf6dk-hyaaa-aaaaq-qaaaq-cai"
echo ""
echo "Test accounts funded with ICP:"
echo "- Alice: $ALICE_ACCOUNT_ID (100 ICP)"
echo "- Bob: $BOB_ACCOUNT_ID (100 ICP)"
echo "- Charlie: $CHARLIE_ACCOUNT_ID (100 ICP)"
echo ""
echo "Now you can run lbry_fun tests!"

# Return to original directory
cd -