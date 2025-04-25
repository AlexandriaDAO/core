#!/bin/bash

# Set variables
CANISTER_ID="uxyan-oyaaa-aaaap-qhezq-cai" # Updated for icrc7_scion
# AUTHORIZED_PRINCIPAL="5sh5r-gyaaa-aaaap-qkmra-cai" # No longer needed for this script
MAX_BATCH_SIZE=100
TEMP_DIR=$(mktemp -d)
BATCH_FILE="$TEMP_DIR/batch.json"
FAILED_LOG="$TEMP_DIR/failed_batches.log"

# Determine the correct path to full_archive.mo for icrc7_scion
# Assuming a similar file structure
SCRIPT_DIR=$(dirname "$0")
if [ -f "$SCRIPT_DIR/full_archive.mo" ]; then
  ARCHIVE_FILE="$SCRIPT_DIR/full_archive.mo"
elif [ -f "$SCRIPT_DIR/../icrc7_scion/full_archive.mo" ]; then # Check relative path for scion
  ARCHIVE_FILE="$SCRIPT_DIR/../icrc7_scion/full_archive.mo"
elif [ -f "full_archive.mo" ]; then
  ARCHIVE_FILE="full_archive.mo"
elif [ -f "src/icrc7_scion/full_archive.mo" ]; then # Check project root path for scion
  ARCHIVE_FILE="src/icrc7_scion/full_archive.mo"
else
  echo "Error: Could not find full_archive.mo file for icrc7_scion"
  echo "Please make sure the file exists in the icrc7_scion directory or adjust the path."
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "Starting NFT minting process for icrc7_scion from $ARCHIVE_FILE"
echo "Canister ID: $CANISTER_ID"

# Check if the canister is installed
echo "Checking if canister is available..."
if ! dfx canister status $CANISTER_ID &>/dev/null; then
  echo "Error: Canister $CANISTER_ID not found or not installed"
  echo "Please make sure the canister is deployed and running"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Check if the current identity is a controller of the canister
echo "Checking if you are a controller of the canister..."
CURRENT_PRINCIPAL=$(dfx identity get-principal)
CONTROLLERS=$(dfx canister info $CANISTER_ID | grep "Controllers" | sed 's/Controllers: //')

if ! echo "$CONTROLLERS" | grep -q "$CURRENT_PRINCIPAL"; then
  echo "Error: Your current identity ($CURRENT_PRINCIPAL) is not a controller of canister $CANISTER_ID"
  echo "Please switch to a controller identity and try again."
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "Confirmed: You are a controller of the canister ($CURRENT_PRINCIPAL)."
echo "Batch size: $MAX_BATCH_SIZE"

# Extract NFT data entries from full_archive.mo
echo "Extracting NFT data from $ARCHIVE_FILE..."
grep -o '{ token_id = [^;]*; owner = [^;]*; description = [^;]*; }' "$ARCHIVE_FILE" > "$TEMP_DIR/nft_entries.txt"

# Count total NFTs
TOTAL_NFTS=$(wc -l < "$TEMP_DIR/nft_entries.txt")
echo "Found $TOTAL_NFTS NFTs to mint"

if [ $TOTAL_NFTS -eq 0 ]; then
  echo "No NFTs found in the archive file. Please check the file format."
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Function to convert a batch of NFT entries to a JSON format for minting
process_batch() {
  local batch_file=$1
  local output_file=$2
  
  echo -n '(vec {' > "$output_file"
  
  # Process each NFT entry
  while IFS= read -r entry; do
    # Extract token_id, owner, and description
    token_id=$(echo "$entry" | grep -o 'token_id = [^;]*' | sed 's/token_id = //')
    owner=$(echo "$entry" | grep -o 'owner = [^;]*' | grep -o 'Principal\.fromText("[^"]*")')
    owner=${owner#Principal.fromText(}
    owner=${owner%)}
    
    # Format as Candid
    echo -n "record { token_id = $token_id; owner = opt record { owner = principal $owner; subaccount = null }; metadata = variant { Map = vec { record { \"description\"; variant { Text = \"\" } } } }; created_at_time = null; memo = null; override = false };" >> "$output_file"
  done < "$batch_file"
  
  echo -n '})' >> "$output_file"
}

# IMPORTANT: Manually build and reinstall the canister before running!
# echo "Ensuring canister has the latest code..."
# dfx build icrc7_scion
# dfx canister install $CANISTER_ID --mode upgrade

# Process and mint in batches
BATCH_NUMBER=1
PROCESSED=0
FAILED_COUNT=0

while [ $PROCESSED -lt $TOTAL_NFTS ]; do
  BATCH_START=$((PROCESSED + 1))
  BATCH_END=$((PROCESSED + MAX_BATCH_SIZE))
  if [ $BATCH_END -gt $TOTAL_NFTS ]; then
    BATCH_END=$TOTAL_NFTS
  fi
  
  CURRENT_BATCH_SIZE=$((BATCH_END - BATCH_START + 1))
  echo "Processing batch $BATCH_NUMBER ($BATCH_START-$BATCH_END of $TOTAL_NFTS, size: $CURRENT_BATCH_SIZE)"
  
  # Extract current batch
  sed -n "${BATCH_START},${BATCH_END}p" "$TEMP_DIR/nft_entries.txt" > "$TEMP_DIR/current_batch.txt"
  
  # Process batch into Candid format
  process_batch "$TEMP_DIR/current_batch.txt" "$BATCH_FILE"
  
  # Mint the batch using the dev_mint function (modified for local dev)
  echo "Attempting to mint batch $BATCH_NUMBER..."
  if ! dfx canister call $CANISTER_ID dev_mint "$(cat $BATCH_FILE)"; then
    echo "Error minting batch $BATCH_NUMBER on first attempt. Retrying in 5 seconds..."
    sleep 5
    if ! dfx canister call $CANISTER_ID dev_mint "$(cat $BATCH_FILE)"; then
      echo "Failed to mint batch $BATCH_NUMBER after retry. Logging and skipping." 
      echo "Failed Batch: $BATCH_NUMBER (NFTs $BATCH_START-$BATCH_END)" >> "$FAILED_LOG"
      FAILED_COUNT=$((FAILED_COUNT + 1))
      # --- Script continues to next batch instead of exiting --- 
    else 
       echo "Batch $BATCH_NUMBER minted successfully on retry."
    fi
  else
     echo "Batch $BATCH_NUMBER minted successfully on first attempt."
  fi
  
  # Update counters
  PROCESSED=$BATCH_END
  BATCH_NUMBER=$((BATCH_NUMBER + 1))
  
  # Small delay between batches to avoid overloading the canister
  sleep 2
done

echo ""
echo "----------------------------------------------"
echo "NFT Minting Process Finished for ICRC7_SCION"
echo "----------------------------------------------"
TOTAL_BATCHES=$((BATCH_NUMBER - 1))
SUCCESS_BATCHES=$((TOTAL_BATCHES - FAILED_COUNT))
echo "Total Batches Processed: $TOTAL_BATCHES"
echo "Successful Batches: $SUCCESS_BATCHES"
echo "Failed Batches: $FAILED_COUNT"

# Check if any batches failed and display log
if [ -f "$FAILED_LOG" ]; then
  echo ""
  echo "(Failed batch details logged to $FAILED_LOG within $TEMP_DIR)"
fi

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "⚠️  IMPORTANT NOTE ⚠️"
echo "The icrc7_scion canister now contains a 'dev_mint' function for local development."
echo "It bypasses standard security checks and should NEVER be deployed to mainnet."
echo ""

# Make the script executable
chmod +x "$0"
