#!/bin/bash
# shelf_item_scenario.sh - Test script for shelf items (adding and reordering markdown items)

# Set up colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SHELF ITEMS TEST (ADD AND REORDER) ===${NC}"

# Step 1: Get the current user's principal
echo -e "\n${YELLOW}Step 1: Getting current principal${NC}"
PRINCIPAL=$(dfx identity get-principal)
echo -e "Current principal: ${GREEN}$PRINCIPAL${NC}"

# Step 2: Create a test shelf
echo -e "\n${YELLOW}Step 2: Creating test shelf${NC}"

echo "Creating shelf: Reading List..."
SHELF=$(dfx canister call perpetua store_shelf '("Reading List", opt "Books I want to read", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf ID: ${GREEN}$SHELF${NC}"

# Step 3: Add Markdown items to the shelf
echo -e "\n${YELLOW}Step 3: Adding Markdown items to the shelf${NC}"

echo "Adding item 1: The Lord of the Rings..."
dfx canister call perpetua add_item_to_shelf "(\"$SHELF\", 
  record { 
    content = variant { Markdown = \"The Lord of the Rings by J.R.R. Tolkien\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

echo "Adding item 2: Dune..."
dfx canister call perpetua add_item_to_shelf "(\"$SHELF\", 
  record { 
    content = variant { Markdown = \"Dune by Frank Herbert\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

echo "Adding item 3: Foundation..."
dfx canister call perpetua add_item_to_shelf "(\"$SHELF\", 
  record { 
    content = variant { Markdown = \"Foundation by Isaac Asimov\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

# Step 4: Check shelf contents
echo -e "\n${YELLOW}Step 4: Checking shelf items${NC}"
echo "Getting shelf items..."
ITEMS_RESPONSE=$(dfx canister call perpetua get_shelf_items "(\"$SHELF\")" --output idl)
echo "$ITEMS_RESPONSE"

# Extract item IDs using regex
echo -e "\n${YELLOW}Extracting item IDs...${NC}"
ITEM_IDS=($(echo "$ITEMS_RESPONSE" | grep -o "id = [0-9]*" | awk '{print $3}'))
echo "Found items with IDs: ${GREEN}${ITEM_IDS[*]}${NC}"

# Step 5: Reorder items - move the last item to be first
if [ ${#ITEM_IDS[@]} -ge 3 ]; then
  echo -e "\n${YELLOW}Step 5: Reordering items - moving item ${ITEM_IDS[2]} before item ${ITEM_IDS[0]}${NC}"
  dfx canister call perpetua reorder_shelf_item "(\"$SHELF\", 
    record { 
      item_id = ${ITEM_IDS[2]}; 
      reference_item_id = opt ${ITEM_IDS[0]}; 
      before = true 
    })" --output idl
else
  echo -e "\n${RED}Not enough items to reorder${NC}"
fi

# Step 6: Check updated shelf order
echo -e "\n${YELLOW}Step 6: Checking new item order${NC}"
echo "Getting shelf items again..."
dfx canister call perpetua get_shelf_items "(\"$SHELF\")" --output idl

# Step 7: Remove the middle item
if [ ${#ITEM_IDS[@]} -ge 2 ]; then
  echo -e "\n${YELLOW}Step 7: Removing item ${ITEM_IDS[1]}${NC}"
  dfx canister call perpetua remove_item_from_shelf "(\"$SHELF\", ${ITEM_IDS[1]})" --output idl
else
  echo -e "\n${RED}Not enough items to remove one${NC}"
fi

# Step 8: Final check of shelf contents
echo -e "\n${YELLOW}Step 8: Final check of shelf contents${NC}"
echo "Getting shelf items one last time..."
dfx canister call perpetua get_shelf_items "(\"$SHELF\")" --output idl

echo -e "\n${BLUE}=== TEST COMPLETE ===${NC}"
echo "Results:"
echo "1. Your principal: $PRINCIPAL"
echo "2. Created shelf with ID: $SHELF"
echo "3. Added 3 Markdown items"
echo "4. Reordered items"
echo "5. Removed an item"
echo -e "\nRefer to the outputs above to see if operations worked correctly." 