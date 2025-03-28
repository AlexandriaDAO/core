#!/bin/bash
# shelf_scenario.sh - Test script for profile shelf reordering

# Set up colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PROFILE SHELF REORDERING TEST ===${NC}"

# Step 1: Get the current user's principal
echo -e "\n${YELLOW}Step 1: Getting current principal${NC}"
PRINCIPAL=$(dfx identity get-principal)
echo -e "Current principal: ${GREEN}$PRINCIPAL${NC}"

# Step 2: Create three shelves for testing
echo -e "\n${YELLOW}Step 2: Creating test shelves${NC}"

echo "Creating shelf 1: Books..."
SHELF1=$(dfx canister call perpetua store_shelf '("Books", opt "My favorite books", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 1 ID: ${GREEN}$SHELF1${NC}"

echo "Creating shelf 2: Movies..."
SHELF2=$(dfx canister call perpetua store_shelf '("Movies", opt "My favorite movies", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 2 ID: ${GREEN}$SHELF2${NC}"

echo "Creating shelf 3: Music..."
SHELF3=$(dfx canister call perpetua store_shelf '("Music", opt "My favorite music", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 3 ID: ${GREEN}$SHELF3${NC}"

# Step 3: Check initial shelf order
echo -e "\n${YELLOW}Step 3: Checking initial shelf order${NC}"
echo "Getting user shelves..."
dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl

# Step 4: Reorder shelves (move SHELF3 to the front)
echo -e "\n${YELLOW}Step 4: Reordering shelves - moving Music shelf to the front${NC}"
echo "Moving $SHELF3 before $SHELF1..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF3\", opt \"$SHELF1\", true)" --output idl

# Step 5: Check if reordering worked
echo -e "\n${YELLOW}Step 5: Checking new shelf order${NC}"
echo "Getting user shelves again..."
dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl

# Step 6: Reset the profile order
echo -e "\n${YELLOW}Step 6: Resetting profile order${NC}"
echo "Resetting profile order to default..."
dfx canister call perpetua reset_profile_order "()" --output idl

# Step 7: Verify the reset
echo -e "\n${YELLOW}Step 7: Verifying reset (should be back to timestamp order)${NC}"
echo "Getting user shelves after reset..."
dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl

echo -e "\n${BLUE}=== TEST COMPLETE ===${NC}"
echo "Results:"
echo "1. Your principal: $PRINCIPAL"
echo "2. Created 3 shelves with IDs:"
echo "   - Books: $SHELF1"
echo "   - Movies: $SHELF2" 
echo "   - Music: $SHELF3"
echo "3. Attempted to move Music shelf to the front"
echo "4. Reset the profile order"
echo -e "\nRefer to the outputs above to see if reordering worked correctly."