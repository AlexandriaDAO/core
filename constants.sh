#!/usr/bin/env bash

set -euo pipefail

# Works even when scripts invoked from outside of repository
repo_root() {
    local SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
    echo "$SCRIPT_DIR"
}

REPO_ROOT=$(repo_root)
echo "REPO_ROOT is set to: $REPO_ROOT"

# We always want to use our downloaded versions when available
export PATH="$REPO_ROOT/bin:${PATH}"
export REPO_ROOT

# Set default values for variables if not already set
: ${IC_COMMIT:="release-2023-09-13_23-08"}
: ${DFX_VERSION:="0.23.0"}
: ${CANISTER_TEST:=""}

# Export these variables
export IC_COMMIT
export DFX_VERSION
export CANISTER_TEST

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    if [ ! -f "$REPO_ROOT/.env" ]; then
        touch "$REPO_ROOT/.env"
    fi
    sed -i "s|^$key=.*|$key='$value'|" "$REPO_ROOT/.env" || echo "$key='$value'" >> "$REPO_ROOT/.env"
}

# Function to get canister ID from canister_ids.json
get_canister_id() {
    local canister_name=$1
    jq -r ".[\"$canister_name\"].ic" "$REPO_ROOT/canister_ids.json"
}

# Update canister IDs in .env
update_env "CANISTER_ID_XRC" $(get_canister_id "xrc")
update_env "CANISTER_ID_VETKD" $(get_canister_id "vetkd")
update_env "CANISTER_ID_TOKENOMICS" $(get_canister_id "tokenomics")
update_env "CANISTER_ID_SYSTEM_API" $(get_canister_id "system_api")
update_env "CANISTER_ID_NFT_MANAGER" $(get_canister_id "nft_manager")
update_env "CANISTER_ID_INTERNET_IDENTITY" $(get_canister_id "internet_identity")
update_env "CANISTER_ID_ICRC7" $(get_canister_id "icrc7")
update_env "CANISTER_ID_ICP_SWAP" $(get_canister_id "icp_swap")
update_env "CANISTER_ID_ICP_LEDGER_CANISTER" $(get_canister_id "icp_ledger_canister")
update_env "CANISTER_ID_BOOKMARKS" $(get_canister_id "bookmarks")
update_env "CANISTER_ID_ALEX_WALLET" $(get_canister_id "alex_wallet")
update_env "CANISTER_ID_ALEX_LIBRARIAN" $(get_canister_id "alex_librarian")
update_env "CANISTER_ID_ALEX_FRONTEND" $(get_canister_id "alex_frontend")
update_env "CANISTER_ID_ALEX_BACKEND" $(get_canister_id "alex_backend")
update_env "CANISTER_ID_LBRY" $(get_canister_id "LBRY")
update_env "CANISTER_ID_ALEX" $(get_canister_id "ALEX")
update_env "CANISTER_ID" $(get_canister_id "alex_frontend")
update_env "REACT_LOCAL_APP_ID" "UncensoredGreats"
update_env "REACT_MAINNET_APP_ID" "UncensoredGreats"

update_env "CANISTER_CANDID_PATH_ALEX_BACKEND" "$REPO_ROOT/src/alex_backend/alex_backend.did"
update_env "CANISTER_CANDID_PATH" "$REPO_ROOT/.dfx/local/canisters/alex_frontend/assetstorage.did"


echo "Environment variables updated successfully."

# Source the updated .env file
source "$REPO_ROOT/.env"

# Identity management
dfx identity new minter --storage-mode plaintext 2>/dev/null || true
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

# OS detection
case "$(uname -sr)" in
   Darwin*)
     export OS="darwin"
     ;;
   Linux*Microsoft*)
     export OS="linux"
     ;;
   Linux*)
     export OS="linux"
     ;;
   *)
     echo "Unknown OS!"
     exit 1
     ;;
esac
