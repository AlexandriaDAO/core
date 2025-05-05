#!/bin/bash

# --- Configuration ---
CANISTER_ID="ya6k4-waaaa-aaaap-qkmpq-cai" # <<< Verify this is your target canister
NETWORK="ic"                          # "ic" for mainnet, "local" for local testing
BACKUP_DIR="data"                     # Simplified backup directory
OUTPUT_FILE="shelves.raw"             # Single raw output file

# --- Backup method --- 
DFX_METHOD_NAME="backup_get_essential_shelves"

# --- Ensure backup directory exists ---
mkdir -p "$BACKUP_DIR"
OUTPUT_PATH="$BACKUP_DIR/$OUTPUT_FILE"
echo "Essential raw backup data will be saved to: $OUTPUT_PATH"

# --- Single Fetch Function ---
fetch_essential_data() {
    local method="$1"
    local outfile="$2"

    echo "[Processing] Fetching essential shelf data..."
    rm -f "$outfile" # Clear previous backup file

    # Request a large limit to get all data in one go, assuming it fits IC limits
    local large_limit=10000 
    local call_args="(record { limit = $large_limit : nat64; offset = 0 : nat64 })"

    echo "  Calling $method..."
    
    # Make the single dfx call and save raw output directly
    # Increased timeout slightly
    timeout 180 dfx canister --network "$NETWORK" call --candid ../perpetua.did "$CANISTER_ID" "$method" "$call_args" > "$outfile" 2>&1
    local exit_code=$?

    # Check dfx exit code
    if [[ $exit_code -ne 0 ]]; then
        echo "  ERROR: dfx call failed for $method (Exit Code: $exit_code)."
        echo "  Raw output (if any) saved to: $outfile"
        if [[ $exit_code -eq 124 ]]; then echo "  Call timed out."; fi
        echo "  Command: dfx canister --network $NETWORK call --candid ../perpetua.did $CANISTER_ID $method '$call_args'"
        return 1 # Indicate failure
    fi

    # Check if canister returned an error variant in the raw output
    # Use -s for silent grep, check exit status
    if grep -q '(variant { Err' "$outfile"; then
        echo "  ERROR: Canister returned error for $method:"
        grep -A 5 '(variant { Err' "$outfile" # Show the error from the file
        echo "  Raw output saved to: $outfile"
        return 1 # Indicate failure
    fi

    # Check if the output seems valid (contains 'total_count')
    if ! grep -q 'total_count' "$outfile"; then
        echo "  WARNING: Output in $outfile doesn't seem to contain 'total_count'. Check the file content."
        # Decide if this should be a failure or just a warning
        # return 1 
    fi

    echo "[Finished] Raw data saved to: $outfile"
    return 0 # Indicate success
}

# --- Execute the Single Backup Task --- 
echo "--- Starting Perpetua Essential Raw Backup ---"
echo "Canister: $CANISTER_ID on Network: $NETWORK"
echo "Output File: $OUTPUT_PATH"
echo ""

fetch_successful=true
start_time=$(date +%s)

if ! fetch_essential_data "$DFX_METHOD_NAME" "$OUTPUT_PATH"; then
    fetch_successful=false
    echo "ERROR during raw backup of $DFX_METHOD_NAME."
fi

end_time=$(date +%s)
duration=$((end_time - start_time))

# --- Final Summary --- 
echo "--- Essential Raw Backup Script Finished ---"
echo "Total execution time: ${duration} seconds."
if $fetch_successful; then
    echo "Essential backup task completed successfully."
    echo "Raw backup data saved to $OUTPUT_PATH"
    echo ""
    echo "Next Step (Restore):"
    echo "1. Ensure the canister has the updated 'restore_essential_shelves' function."
    echo "2. Run: dfx canister --network $NETWORK call $CANISTER_ID restore_essential_shelves --argument-file $OUTPUT_PATH"
else
    echo "WARNING: The essential backup task encountered errors. Please check the logs above."
    echo "Raw data file (if created) is at $OUTPUT_PATH"
fi