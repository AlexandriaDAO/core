#!/bin/bash
# shelf_order_test.sh - Simplified test for shelf ordering in backend

# Set up colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PROFILE SHELF ORDERING TEST (BACKEND) ===${NC}"
echo -e "${CYAN}This script tests if the backend properly handles custom shelf ordering${NC}"

# Get the current user's principal
PRINCIPAL=$(dfx identity get-principal)
echo -e "Principal: ${GREEN}$PRINCIPAL${NC}"

# Create test shelves with unique names to easily identify them
echo -e "\n${YELLOW}Creating test shelves...${NC}"
SHELF1=$(dfx canister call perpetua store_shelf '("Test-A-Books", opt "Test shelf A", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
SHELF2=$(dfx canister call perpetua store_shelf '("Test-B-Movies", opt "Test shelf B", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
SHELF3=$(dfx canister call perpetua store_shelf '("Test-C-Music", opt "Test shelf C", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')

echo -e "Created: \n- Test-A-Books: $SHELF1\n- Test-B-Movies: $SHELF2\n- Test-C-Music: $SHELF3"

# Function to extract just our test shelves from the response
extract_shelves() {
  # Focus only on our Test-* shelves for clarity
  echo "$1" | grep -E "title = \"Test-[A-C]" -A 8 | grep -E "title = |shelf_id = " | paste - - | sed 's/.*title = \(.*\); .*shelf_id = \(.*\);.*/\2 (\1)/'
}

# Check initial order (should be timestamp-based, so A, B, C)
echo -e "\n${YELLOW}Initial shelf order (timestamp-based):${NC}"
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
extract_shelves "$USER_SHELVES"

# Apply custom ordering: C → B → A (reverse of timestamp order)
echo -e "\n${YELLOW}Applying custom order (Test-C → Test-B → Test-A)...${NC}"

# Move C to front
echo "• Moving Test-C-Music to front..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF3\", null, true)" --output idl > /dev/null

# Move B after C
echo "• Moving Test-B-Movies after Test-C-Music..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF2\", opt \"$SHELF3\", false)" --output idl > /dev/null

# Move A after B
echo "• Moving Test-A-Books after Test-B-Movies..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF1\", opt \"$SHELF2\", false)" --output idl > /dev/null

# Check if ordering worked in backend
echo -e "\n${YELLOW}Custom order result (should be C → B → A):${NC}"
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
extract_shelves "$USER_SHELVES"

# Reset to timestamp order
echo -e "\n${YELLOW}Resetting to timestamp order...${NC}"
dfx canister call perpetua reset_profile_order "()" --output idl > /dev/null

# Verify reset worked
echo -e "\n${YELLOW}Final order after reset (should be timestamp-based: A → B → C):${NC}"
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
extract_shelves "$USER_SHELVES"

echo -e "\n${BLUE}=== TEST SUMMARY ===${NC}"
echo -e "${CYAN}The backend ordering appears to be working if the order above changed from:${NC}"
echo -e "  1. Initial:  A → B → C  (timestamp order)"
echo -e "  2. Custom:   C → B → A  (reversed order)"
echo -e "  3. Reset:    A → B → C  (back to timestamp order)"
echo -e ""
