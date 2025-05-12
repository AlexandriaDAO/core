#!/bin/bash

set -eo pipefail # Exit on error, treat unset variables as an error, and propagate pipeline failures.
# set -x # Uncomment for verbose command execution

# --- Configuration ---
PERPETUA_CANISTER_ID="ya6k4-waaaa-aaaap-qkmpq-cai" # Replace with your actual canister ID if different
DFX_NETWORK="local" # Or your target network

# Define user identities (ensure these are set up in dfx)
USER_1_IDENTITY="user_1"
USER_2_IDENTITY="user_2"
USER_3_IDENTITY="user_3"
DEFAULT_IDENTITY="default" # Or another identity for general queries

# --- Helper Functions ---
DFX_CMD="dfx"

# Function to make a dfx canister call
# $1: Identity to use
# $2: Canister method
# $3: Arguments (Candid string)
# $4: Optional --query flag
call_canister() {
    local identity="$1"
    local method="$2"
    local args="$3"
    local query_flag="$4"

    echo "----------------------------------------------------------------------" >&2
    echo "CALLING: Method '$method' as identity '$identity'" >&2
    echo "ARGS: $args" >&2
    if [[ "$query_flag" == "--query" ]]; then
        echo "TYPE: Query Call" >&2
    else
        echo "TYPE: Update Call" >&2
    fi
    echo "----------------------------------------------------------------------" >&2

    local dfx_output
    local dfx_stderr_file
    dfx_stderr_file=$(mktemp)

    if [[ "$query_flag" == "--query" ]]; then
        dfx_output=$($DFX_CMD identity use "$identity" >/dev/null && \
                 $DFX_CMD canister --network "$DFX_NETWORK" call "$PERPETUA_CANISTER_ID" "$method" "$args" --query 2>"$dfx_stderr_file")
    else
        dfx_output=$($DFX_CMD identity use "$identity" >/dev/null && \
                 $DFX_CMD canister --network "$DFX_NETWORK" call "$PERPETUA_CANISTER_ID" "$method" "$args" 2>"$dfx_stderr_file")
    fi
    
    if [[ -s "$dfx_stderr_file" ]]; then
        echo "STDERR from dfx call:" >&2
        cat "$dfx_stderr_file" >&2
    fi
    rm -f "$dfx_stderr_file"

    echo "OUTPUT (stdout from dfx call for logging):" >&2 # Clarify this is for logging
    echo "$dfx_output" >&2 # Log the raw output to stderr for debugging
    echo -e "----------------------------------------------------------------------\n" >&2
    
    # This function is used in command substitution, so it should only output the final dfx_output to stdout
    echo "$dfx_output"
}

# --- Test Script ---

echo "===== Starting Perpetua Feed Test Script (v2) ====="

# Attempt to make 'mainnet' identity a controller of the 'perpetua' canister
echo "INFO: Attempting to ensure 'mainnet' identity can control the 'perpetua' canister..."
CURRENT_DFX_IDENTITY=$(dfx identity whoami)
MAINNET_PRINCIPAL=$(dfx identity get-principal --identity mainnet 2>/dev/null)

if [ -z "$MAINNET_PRINCIPAL" ]; then
    echo "ERROR: 'mainnet' identity principal not found. Please ensure 'mainnet' identity is configured (e.g., via mainnet.pem)."
    # Attempt to restore original identity before exiting
    dfx identity use "$CURRENT_DFX_IDENTITY" >/dev/null
    exit 1
fi

# Temporarily use 'default' identity to try and add 'mainnet' as a controller.
# This assumes 'default' might be a controller if the canister already exists on local.
echo "INFO: Temporarily switching to 'default' identity to manage controllers for 'perpetua'."
dfx identity use "$DEFAULT_IDENTITY" >/dev/null

# Check if the canister exists before trying to update its settings
if dfx canister --network "$DFX_NETWORK" info "$PERPETUA_CANISTER_ID" > /dev/null 2>&1; then
    echo "INFO: 'perpetua' canister ($PERPETUA_CANISTER_ID) found. Attempting to add 'mainnet' ($MAINNET_PRINCIPAL) as a controller."
    if dfx canister --network "$DFX_NETWORK" update-settings "$PERPETUA_CANISTER_ID" --add-controller "$MAINNET_PRINCIPAL"; then
        echo "INFO: 'mainnet' identity successfully added as a controller."
    else
        echo "WARN: Failed to add 'mainnet' as a controller using 'default' identity. This could be an issue if 'mainnet' is not already a controller (e.g., 'default' is not a controller itself, or other restrictions)."
    fi
else
    echo "INFO: 'perpetua' canister ($PERPETUA_CANISTER_ID) does not seem to exist. 'mainnet' will become a controller upon deployment."
fi

# Switch back to the identity that was active before this block, or to mainnet if that was the original.
# The original script intends to use 'mainnet' for the setup operations that follow.
echo "INFO: Switching to 'mainnet' identity for subsequent operations."
dfx identity use mainnet >/dev/null
# End of controller management block

# Cold Start:
dfx identity use mainnet
dfx canister uninstall-code perpetua --network "$DFX_NETWORK" || echo "WARN: uninstall-code failed. This may be okay if canister was already empty or 'mainnet' is now a controller and it failed for other reasons."
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --network "$DFX_NETWORK" --specified-id "$PERPETUA_CANISTER_ID"
dfx generate perpetua
dfx identity use default

# --- Configuration ---
PERPETUA_CANISTER_ID="ya6k4-waaaa-aaaap-qkmpq-cai" # Replace with your actual canister ID if different
DFX_NETWORK="local" # Or your target network

# Define user identities (ensure these are set up in dfx)
USER_1_IDENTITY="user_1"
USER_2_IDENTITY="user_2"
USER_3_IDENTITY="user_3"
DEFAULT_IDENTITY="default" # Or another identity for general queries

# --- Helper Functions ---
DFX_CMD="dfx"

# Function to make a dfx canister call
# $1: Identity to use
# $2: Canister method
# $3: Arguments (Candid string)
# $4: Optional --query flag
call_canister() {
    local identity="$1"
    local method="$2"
    local args="$3"
    local query_flag="$4"

    echo "----------------------------------------------------------------------" >&2
    echo "CALLING: Method '$method' as identity '$identity'" >&2
    echo "ARGS: $args" >&2
    if [[ "$query_flag" == "--query" ]]; then
        echo "TYPE: Query Call" >&2
    else
        echo "TYPE: Update Call" >&2
    fi
    echo "----------------------------------------------------------------------" >&2

    local dfx_output
    local dfx_stderr_file
    dfx_stderr_file=$(mktemp)

    if [[ "$query_flag" == "--query" ]]; then
        dfx_output=$($DFX_CMD identity use "$identity" >/dev/null && \
                 $DFX_CMD canister --network "$DFX_NETWORK" call "$PERPETUA_CANISTER_ID" "$method" "$args" --query 2>"$dfx_stderr_file")
    else
        dfx_output=$($DFX_CMD identity use "$identity" >/dev/null && \
                 $DFX_CMD canister --network "$DFX_NETWORK" call "$PERPETUA_CANISTER_ID" "$method" "$args" 2>"$dfx_stderr_file")
    fi
    
    if [[ -s "$dfx_stderr_file" ]]; then
        echo "STDERR from dfx call:" >&2
        cat "$dfx_stderr_file" >&2
    fi
    rm -f "$dfx_stderr_file"

    echo "OUTPUT (stdout from dfx call for logging):" >&2 # Clarify this is for logging
    echo "$dfx_output" >&2 # Log the raw output to stderr for debugging
    echo -e "----------------------------------------------------------------------\n" >&2
    
    # This function is used in command substitution, so it should only output the final dfx_output to stdout
    echo "$dfx_output"
}

# --- Test Script ---

echo "===== Starting Perpetua Feed Test Script (v2) ====="

# 0. Get Principals for follow commands
dfx identity use "$USER_1_IDENTITY"
USER_1_PRINCIPAL=$(dfx identity get-principal)
dfx identity use "$USER_2_IDENTITY"
USER_2_PRINCIPAL=$(dfx identity get-principal)
dfx identity use "$USER_3_IDENTITY"
USER_3_PRINCIPAL=$(dfx identity get-principal)
echo "User 1 Principal: $USER_1_PRINCIPAL"
echo "User 2 Principal: $USER_2_PRINCIPAL"
echo "User 3 Principal: $USER_3_PRINCIPAL"
echo ""


# --- Setup Phase ---
echo "===== Phase 1: Data Setup ====="

# --- User 1 Creates Shelves ---
echo "--- User 1 ($USER_1_IDENTITY) creating shelves ---"
# Shelf 1A: public_editing = true, tags: "tech", "icp"
SHELF_1A_ID_OUTPUT_CAPTURE=$(call_canister "$USER_1_IDENTITY" "store_shelf" \
    '("Shelf 1A (U1, PE:true, T:tech,icp)", opt "Tech and ICP by User 1", vec {}, opt vec {"tech"; "icp"})')
# call_canister "$USER_1_IDENTITY" "store_shelf" \
#     '("Shelf 1A (U1, PE:true, T:tech,icp)", opt "Tech and ICP by User 1", vec {}, opt vec {"tech"; "icp"})'

SHELF_1A_ID=$(echo "$SHELF_1A_ID_OUTPUT_CAPTURE" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n' )
call_canister "$USER_1_IDENTITY" "toggle_shelf_public_access" '("'"$SHELF_1A_ID"'", true)'
echo "Shelf 1A ID: $SHELF_1A_ID"

# Shelf 1B: public_editing = false, tags: "art"
SHELF_1B_RAW_OUTPUT=$(call_canister "$USER_1_IDENTITY" "store_shelf" \
    '("Shelf 1B (U1, PE:false, T:art)", opt "Art by User 1", vec {}, opt vec {"art"})')
SHELF_1B_ID=$(echo "$SHELF_1B_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
# public_editing is false by default, no toggle needed
echo "Shelf 1B ID: $SHELF_1B_ID"

# Shelf 1C: public_editing = true, tags: "gaming"
SHELF_1C_RAW_OUTPUT=$(call_canister "$USER_1_IDENTITY" "store_shelf" \
    '("Shelf 1C (U1, PE:true, T:gaming)", opt "Gaming by User 1", vec {}, opt vec {"gaming"})')
SHELF_1C_ID=$(echo "$SHELF_1C_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
call_canister "$USER_1_IDENTITY" "toggle_shelf_public_access" '("'"$SHELF_1C_ID"'", true)'
echo "Shelf 1C ID: $SHELF_1C_ID"

# --- User 2 Creates Shelves ---
echo "--- User 2 ($USER_2_IDENTITY) creating shelves ---"
# Shelf 2A: public_editing = true, tags: "art", "rust"
SHELF_2A_RAW_OUTPUT=$(call_canister "$USER_2_IDENTITY" "store_shelf" \
    '("Shelf 2A (U2, PE:true, T:art,rust)", opt "Art and Rust by User 2", vec {}, opt vec {"art"; "rust"})')
SHELF_2A_ID=$(echo "$SHELF_2A_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
call_canister "$USER_2_IDENTITY" "toggle_shelf_public_access" '("'"$SHELF_2A_ID"'", true)'
echo "Shelf 2A ID: $SHELF_2A_ID"

# Shelf 2B: public_editing = false, tags: "web3"
SHELF_2B_RAW_OUTPUT=$(call_canister "$USER_2_IDENTITY" "store_shelf" \
    '("Shelf 2B (U2, PE:false, T:web3)", opt "Web3 by User 2", vec {}, opt vec {"web3"})')
SHELF_2B_ID=$(echo "$SHELF_2B_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
echo "Shelf 2B ID: $SHELF_2B_ID"

# Shelf 2C: public_editing = true, tags: "icp", "tools"
SHELF_2C_RAW_OUTPUT=$(call_canister "$USER_2_IDENTITY" "store_shelf" \
    '("Shelf 2C (U2, PE:true, T:icp,tools)", opt "ICP and Tools by User 2", vec {}, opt vec {"icp"; "tools"})')
SHELF_2C_ID=$(echo "$SHELF_2C_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
call_canister "$USER_2_IDENTITY" "toggle_shelf_public_access" '("'"$SHELF_2C_ID"'", true)'
echo "Shelf 2C ID: $SHELF_2C_ID"

# --- User 3 Creates Shelves ---
echo "--- User 3 ($USER_3_IDENTITY) creating shelves ---"
# Shelf 3A: public_editing = true, tags: "icp", "defi"
SHELF_3A_RAW_OUTPUT=$(call_canister "$USER_3_IDENTITY" "store_shelf" \
    '("Shelf 3A (U3, PE:true, T:icp,defi)", opt "ICP and DeFi by User 3", vec {}, opt vec {"icp"; "defi"})')
SHELF_3A_ID=$(echo "$SHELF_3A_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
call_canister "$USER_3_IDENTITY" "toggle_shelf_public_access" '("'"$SHELF_3A_ID"'", true)'
echo "Shelf 3A ID: $SHELF_3A_ID"

# Shelf 3B: public_editing = false, tags: "gaming"
SHELF_3B_RAW_OUTPUT=$(call_canister "$USER_3_IDENTITY" "store_shelf" \
    '("Shelf 3B (U3, PE:false, T:gaming)", opt "Gaming by User 3", vec {}, opt vec {"gaming"})')
SHELF_3B_ID=$(echo "$SHELF_3B_RAW_OUTPUT" | sed -n 's/.*Ok = "\\([^"]*\\)".*/\\1/p' | head -n 1 | tr -d '\\n')
echo "Shelf 3B ID: $SHELF_3B_ID"

# --- Follow Actions ---
echo "--- Setting up follows ---"
# As user_1, follow user_2.
call_canister "$USER_1_IDENTITY" "follow_user" "(principal \"$USER_2_PRINCIPAL\")"
# As user_1, follow the tag "art".
call_canister "$USER_1_IDENTITY" "follow_tag" '("art")'
# As user_1, follow the tag "tools".
call_canister "$USER_1_IDENTITY" "follow_tag" '("tools")'

# As user_2, follow user_3.
call_canister "$USER_2_IDENTITY" "follow_user" "(principal \"$USER_3_PRINCIPAL\")"
# As user_2, follow the tag "tech".
call_canister "$USER_2_IDENTITY" "follow_tag" '("tech")'

# --- Timer Simulation/Trigger ---
echo "--- Triggering refresh_random_shelf_candidates ---"
call_canister "$DEFAULT_IDENTITY" "debug_trigger_refresh_random_candidates" "()"

# Allow some time for backend processes if necessary (e.g., async updates)
# sleep 2 

# --- Verification Phase ---
echo -e "\n===== Phase 2: Feed Verification ====="

# Verify get_recent_shelves (as default or user_1)
echo "--- Verifying get_recent_shelves ---"
echo "EXPECTED: All created shelves (1A, 1B, 1C, 2A, 2B, 2C, 3A, 3B) should appear, as public_editing does not filter this feed."
echo "The order will be newest first based on creation timestamp."
call_canister "$DEFAULT_IDENTITY" "get_recent_shelves" '(record { cursor=null; limit=20 })' "--query"

# Verify get_shuffled_by_hour_feed (as default or user_1)
echo "--- Verifying get_shuffled_by_hour_feed ---"
echo "EXPECTED: A shuffled list of shelves. The candidate pool for shuffling should include ALL created shelves (1A, 1B, 1C, 2A, 2B, 2C, 3A, 3B)."
echo "The exact order is unpredictable due to shuffling, but items should be from this pool."
call_canister "$DEFAULT_IDENTITY" "get_shuffled_by_hour_feed" '(20)' "--query" # Request up to 20 shelves

# Verify get_storyline_feed (as user_1)
echo "--- Verifying get_storyline_feed for User 1 ($USER_1_IDENTITY) ---"
echo "User 1 follows User 2, tag 'art', tag 'tools'."
echo "EXPECTED from User 2 (public_editing=true): Shelf 2A (art,rust), Shelf 2C (icp,tools)."
echo "EXPECTED from tag 'art' (public_editing=true): Shelf 1B (U1, T:art, PE:false -> NO), Shelf 2A (U2, T:art, PE:true -> YES)."
echo "EXPECTED from tag 'tools' (public_editing=true): Shelf 2C (U2, T:icp,tools, PE:true -> YES)."
echo "Overall distinct expected for User 1: Shelf 2A, Shelf 2C. (Order by creation time, newest first)"
call_canister "$USER_1_IDENTITY" "get_storyline_feed" '(record { cursor=null; limit=20 })' "--query"

# Verify get_storyline_feed (as user_2)
echo "--- Verifying get_storyline_feed for User 2 ($USER_2_IDENTITY) ---"
echo "User 2 follows User 3, tag 'tech'."
echo "EXPECTED from User 3 (public_editing=true): Shelf 3A (icp,defi)."
echo "EXPECTED from tag 'tech' (public_editing=true): Shelf 1A (U1, T:tech, PE:true -> YES)."
echo "Overall distinct expected for User 2: Shelf 3A, Shelf 1A. (Order by creation time, newest first)"
call_canister "$USER_2_IDENTITY" "get_storyline_feed" '(record { cursor=null; limit=20 })' "--query"

# --- My Followed Users/Tags (Sanity Check) ---
echo "--- Sanity Check: User 1 My Followed Users & Tags ---"
call_canister "$USER_1_IDENTITY" "get_my_followed_users" "()" "--query"
call_canister "$USER_1_IDENTITY" "get_my_followed_tags" "()" "--query"

echo "--- Sanity Check: User 2 My Followed Users & Tags ---"
call_canister "$USER_2_IDENTITY" "get_my_followed_users" "()" "--query"
call_canister "$USER_2_IDENTITY" "get_my_followed_tags" "()" "--query"


echo -e "\n===== Perpetua Feed Test Script (v2) Finished ====="
# Switch back to default identity
dfx identity use "$DEFAULT_IDENTITY"
