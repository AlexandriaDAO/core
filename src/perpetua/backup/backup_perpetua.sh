#!/bin/bash

# --- Configuration ---
CANISTER_ID="ya6k4-waaaa-aaaap-qkmpq-cai" # <<< REPLACE THIS if needed
NETWORK="ic" # Use "local" or "ic"
BACKUP_DIR="data" # Directory to store backup files
PAGE_LIMIT=100 # Adjust based on data size and cycle limits

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"
# Clear previous backup files
rm -f "$BACKUP_DIR"/*.candid "$BACKUP_DIR"/*.raw

echo "--- Starting Perpetua Backup ---"
echo "Canister: $CANISTER_ID on Network: $NETWORK"
echo "Backup Dir: $BACKUP_DIR"
echo "Page Limit: $PAGE_LIMIT"
echo ""

# --- Function to fetch paginated data for a given method ---
# Usage: fetch_data <dfx_method_name> <output_filename>
fetch_data() {
    local method="$1"
    local outfile="$2"
    local full_outfile="$BACKUP_DIR/$outfile"
    local raw_outfile_base="$BACKUP_DIR/${outfile%.candid}" # Base name for .raw files

    echo "[Processing] Fetching data for: $method"
    echo "Outputting Candid data to: $full_outfile"
    # Clear target file and raw files for this method
    > "$full_outfile"
    rm -f "${raw_outfile_base}."*.raw

    local offset=0
    local total_fetched=0
    local total_expected=-1 # Start with unknown total
    local iterations=0
    local max_iterations=1000 # Safety break

    while [[ $iterations -lt $max_iterations ]]; do
        iterations=$((iterations + 1))
        echo "  Fetching page (offset: $offset)... Iteration: $iterations"
        local call_args="(record { limit = $PAGE_LIMIT : nat64; offset = $offset : nat64 })"

        # Make the call
        local output
        output=$(timeout 60 dfx canister --network "$NETWORK" call "$CANISTER_ID" "$method" "$call_args" 2>&1)
        local exit_code=$?

        # Save raw output for debugging this page
        echo "$output" >> "${raw_outfile_base}.page_${iterations}.raw"

        # Check dfx exit code (including timeout)
        if [[ $exit_code -ne 0 ]]; then
            echo "  ERROR: dfx call failed for $method (Offset: $offset, Exit Code: $exit_code)."
            if [[ $exit_code -eq 124 ]]; then echo "  Call timed out."; fi
            # Ensure canister ID and args are quoted correctly in error message
            echo "  Command: dfx canister --network $NETWORK call \"$CANISTER_ID\" $method '$call_args'"
            echo "  Output/Error: $output"
            echo "  Skipping remaining pages for $method."
            return 1 # Indicate failure for this method
        fi

        # Check if canister returned an error variant
        # Make grep quieter (-q)
        if echo "$output" | grep -q '(variant { Err'; then
            echo "  ERROR: Canister returned error for $method (Offset: $offset):"
            # Print only relevant part of error if possible
            echo "$output" | grep -A 5 '(variant { Err'
            echo "  Skipping remaining pages for $method."
            return 1 # Indicate failure for this method
        fi

        # --- Crude Parsing (Highly Fragile) ---
        # Extract total_count (only on first iteration if successful)
        if [[ $total_expected -eq -1 ]]; then
             # Try to find 'total_count = <number> : (nat | nat64)' pattern
             local total_count_line
             total_count_line=$(echo "$output" | grep -o 'total_count = [0-9]* : \(nat\|nat64\)')
             if [[ -n "$total_count_line" ]]; then
                 total_expected=$(echo "$total_count_line" | sed 's/total_count = \([0-9]*\) : .*/\1/')
                 echo "    Total items expected for $method: $total_expected"
                 # Handle case where total expected is 0 immediately
                 if [[ $total_expected -eq 0 ]]; then
                     echo "    No items to fetch for $method."
                     break # Exit while loop
                 fi
             else
                 echo "    Warning: Could not parse total_count for $method on first page. Will rely on page content."
                 total_expected=-2 # Indicate parsing failed, rely on page counts
             fi
        fi

        # Extract the 'data = vec { ... };' part. This is very basic.
        # It captures everything between 'data = vec {' and the *matching* '};'
        # This relies heavily on the structure and might fail with nested vecs/records.
        local data_part
        data_part=$(echo "$output" | sed -n '/data = vec {/,/};/p' | sed '1d;$d' ) # Remove 'data = vec {' and last '};'

        local current_page_count=0
        if [[ -n "$data_part" ]]; then
            # Append the extracted items (hopefully raw Candid records/tuples) to the output file
            # Add a newline between items from different pages for slight readability
            if [[ $offset -gt 0 ]]; then echo "" >> "$full_outfile"; fi
            echo "$data_part" >> "$full_outfile"

            # Estimate count by lines starting with '(' or 'record {' (adjust if needed)
            # This is a very rough estimate!
            current_page_count=$(echo "$data_part" | grep -c -E '^\s*\(|^\s*record\s*{')
        else
             # If data_part is empty, check if the output indicates an empty vec 'data = vec {}'
             if echo "$output" | grep -q 'data = vec {}'; then
                  current_page_count=0
                  echo "    Received empty data vector."
             else
                  echo "    Warning: Could not extract 'data' vector content for offset $offset. Assuming end of data or parse error."
                  # Force break if we couldn't parse total_count either
                  if [[ $total_expected -eq -2 ]]; then break; fi
             fi
        fi

        total_fetched=$((total_fetched + current_page_count))
        echo "    Fetched approx $current_page_count items on this page. Total fetched so far: $total_fetched"

        # --- Loop Termination Conditions ---
        # 1. If total_count was parsed and we've fetched enough (use >= just in case count is off)
        if [[ $total_expected -ge 0 && $total_fetched -ge $total_expected ]]; then
           echo "    Fetched all expected items ($total_fetched/$total_expected) for $method."
           break
        fi

        # 2. If the number of items returned on this page is less than the requested limit
        #    (Primary signal if total_count wasn't parsed reliably)
        if [[ $current_page_count -lt $PAGE_LIMIT ]]; then
            echo "    Last page fetched for $method (returned $current_page_count items, less than limit $PAGE_LIMIT)."
            # If total_expected was parsed, check for mismatch
            if [[ $total_expected -ge 0 && $total_fetched -ne $total_expected ]]; then
                 echo "    WARNING: Final fetched count ($total_fetched) does not match expected total ($total_expected) for $method!"
            fi
            break
        fi

        # 3. Safety break if total_count parsing failed and we keep getting full pages
        if [[ $total_expected -eq -2 && $iterations -ge $max_iterations ]]; then
             echo "  WARNING: Reached max iterations ($max_iterations) for $method without parsing total_count or reaching end condition."
             break
        fi

        offset=$((offset + PAGE_LIMIT))
    done # End of while loop for method pages

    if [[ $iterations -ge $max_iterations ]]; then
        echo "  WARNING: Reached maximum iterations ($max_iterations) for $method. Backup might be incomplete."
    fi
    echo "[Finished] Processing for: $method"
    echo ""
    return 0 # Indicate success for this method
}

# --- Define Backup Tasks ---
# Array format: "dfx_method_name:output_filename.candid"
declare -a backup_tasks=(
    "backup_get_shelves:shelves.candid"
    "backup_get_user_shelves:user_shelves.candid"
    "backup_get_nft_shelves:nft_shelves.candid"
    "backup_get_user_profile_orders:user_profile_orders.candid"
    "backup_get_tag_metadata:tag_metadata.candid"
    "backup_get_tag_shelf_associations:tag_shelf_associations.candid"
    "backup_get_shelf_tag_associations:shelf_tag_associations.candid"
    "backup_get_tag_lexical_index:tag_lexical_index.candid"
    "backup_get_followed_users:followed_users.candid"
    "backup_get_followed_tags:followed_tags.candid"
    # Add other backup methods here if created
)

# --- Execute Backup Tasks ---
all_successful=true
for task in "${backup_tasks[@]}"; do
    method="${task%%:*}"
    outfile="${task#*:}"
    if ! fetch_data "$method" "$outfile"; then
        all_successful=false
        echo "ERROR during backup of $method. Continuing with others..."
    fi
done

# --- Final Summary ---
echo "--- Backup Script Finished ---"
if $all_successful; then
    echo "All backup tasks completed successfully."
    echo "Raw Candid data saved to files in $BACKUP_DIR/*.candid"
else
    echo "One or more backup tasks encountered errors. Please check the logs above."
    echo "Partial data may be saved in $BACKUP_DIR/*.candid"
fi
echo "Intermediate raw page outputs saved to $BACKUP_DIR/*.raw"