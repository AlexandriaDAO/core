#!/bin/bash

# --- Configuration ---
# !!! IMPORTANT: Replace 'perpetua' with your actual canister name if different !!!
CANISTER_NAME="perpetua"
# Use the principal you provided
CALLER_PRINCIPAL="4vgwl-3fcra-iv6gc-oyih4-s33mm-tma3t-5fuy4-qir64-bqk5i-zlo6t-rae" 

# Ensure you are using the correct identity for the principal above
# You might need to run: dfx identity use <identity_name_for_principal>
# Or: dfx identity set-wallet <wallet_id> --network ic
echo "--- Make sure you are using the dfx identity corresponding to principal: $CALLER_PRINCIPAL ---"
CURRENT_PRINCIPAL=$(dfx identity get-principal)
echo "Current dfx principal: $CURRENT_PRINCIPAL"
# Optional: Uncomment the line below to exit if principals don't match
# [ "$CURRENT_PRINCIPAL" != "$CALLER_PRINCIPAL" ] && echo "Error: dfx principal does not match required principal." && exit 1
echo "Continuing in 5 seconds..."
sleep 5

echo "--- 1. Creating a test shelf ---"
CREATE_OUTPUT=$(dfx canister call $CANISTER_NAME store_shelf '( "DFX Reorder Test Shelf", opt "", vec {}, opt vec {} )')
echo "$CREATE_OUTPUT"

# Extract Shelf ID (handles potential variations in dfx output format)
SHELF_ID=$(echo "$CREATE_OUTPUT" | grep -oE '"[^"]+"' | sed 's/"//g' | head -n 1)

if [ -z "$SHELF_ID" ]; then
  echo "Error: Could not parse Shelf ID from creation response."
  exit 1
fi
echo "Shelf ID: $SHELF_ID"
echo ""

echo "--- 2. Adding items (assuming IDs 1, 2, 3, 4) ---"

echo "Adding Item 1..."
dfx canister call $CANISTER_NAME add_item_to_shelf "( \"$SHELF_ID\", record { content = variant { Markdown = \"Item 1 Content\" }; reference_item_id = null; before = false } )"
sleep 2 # Add delays between state-changing calls

echo "Adding Item 2..."
dfx canister call $CANISTER_NAME add_item_to_shelf "( \"$SHELF_ID\", record { content = variant { Markdown = \"Item 2 Content\" }; reference_item_id = null; before = false } )"
sleep 2 

echo "Adding Item 3..."
dfx canister call $CANISTER_NAME add_item_to_shelf "( \"$SHELF_ID\", record { content = variant { Markdown = \"Item 3 Content\" }; reference_item_id = null; before = false } )"
sleep 2 

echo "Adding Item 4..."
dfx canister call $CANISTER_NAME add_item_to_shelf "( \"$SHELF_ID\", record { content = variant { Markdown = \"Item 4 Content\" }; reference_item_id = null; before = false } )"
sleep 2 

echo ""
echo "--- Current item order (before reorder attempt) ---"
dfx canister call $CANISTER_NAME get_shelf_items "( \"$SHELF_ID\" )"
echo ""
echo "--- 3. Attempting to reorder: Move Item 3 BEFORE Item 1 ---"
REORDER_OUTPUT=$(dfx canister call $CANISTER_NAME reorder_shelf_item "( \"$SHELF_ID\", record { item_id = 3:nat32; reference_item_id = opt (1:nat32); before = true } )")
echo "Reorder call output: $REORDER_OUTPUT"
echo ""

echo "--- 4. Querying final state ---"
echo "Querying ordered items:"
dfx canister call $CANISTER_NAME get_shelf_items "( \"$SHELF_ID\" )"
echo ""

echo "Querying full shelf data (check item_positions):"
dfx canister call $CANISTER_NAME get_shelf "( \"$SHELF_ID\" )"
echo ""

echo "--- Test Complete ---"
echo "Expected final order (if backend worked): Item 3, Item 1, Item 2, Item 4"
echo "Check the 'get_shelf_items' output above. Also examine the 'item_positions' map in the 'get_shelf' output."
echo "If the order isn't [3, 1, 2, 4], the backend reorder logic is flawed."
