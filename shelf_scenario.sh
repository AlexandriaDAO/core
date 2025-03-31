#!/bin/bash
# shelf_scenario.sh - Test script for profile shelf reordering and item management

# Set up colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color



dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua


echo -e "${BLUE}=== PROFILE SHELF REORDERING TEST ===${NC}"
echo -e "${CYAN}This test demonstrates how shelf ordering affects what a user would see on their profile page.${NC}"
echo -e "${CYAN}The profile view first shows shelves with custom ordering, then remaining shelves by timestamp.${NC}"

# Step 1: Get the current user's principal
echo -e "\n${YELLOW}Step 1: Getting current principal${NC}"
PRINCIPAL=$(dfx identity get-principal)
echo -e "Current principal: ${GREEN}$PRINCIPAL${NC}"

# Step 2: Create three shelves for testing
echo -e "\n${YELLOW}Step 2: Creating test shelves${NC}"

echo "Creating shelf 1: Books... (created first)"
SHELF1=$(dfx canister call perpetua store_shelf '("Books", opt "My favorite books", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 1 ID: ${GREEN}$SHELF1${NC}"

echo "Creating shelf 2: Movies... (created second)"
SHELF2=$(dfx canister call perpetua store_shelf '("Movies", opt "My favorite movies", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 2 ID: ${GREEN}$SHELF2${NC}"

echo "Creating shelf 3: Music... (created third)"
SHELF3=$(dfx canister call perpetua store_shelf '("Music", opt "My favorite music", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 3 ID: ${GREEN}$SHELF3${NC}"

# Step 3: Check initial shelf order (timestamp based)
echo -e "\n${YELLOW}Step 3: Checking initial profile page view${NC}"
echo -e "${CYAN}Initially, no custom ordering exists, so shelves are displayed by timestamp (oldest first)${NC}"
echo "Getting user shelves..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

# Extract shelf IDs and titles for better visibility of order
echo -e "\n${YELLOW}Initial profile page view (timestamp order: Books, Movies, Music)${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

# Step 4: First custom reordering - Move Music to front
echo -e "\n${YELLOW}Step 4: First custom reordering - Moving Music to front of profile${NC}"
echo -e "${CYAN}This marks the profile as customized and creates a position value for Music${NC}"
echo "Moving $SHELF3 (Music) before $SHELF1 (Books)..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF3\", opt \"$SHELF1\", true)" --output idl

# Step 5: Check profile view after first reordering
echo -e "\n${YELLOW}Step 5: Checking profile page view after first custom ordering${NC}"
echo -e "${CYAN}Now Music has a custom position and appears first, Books and Movies follow in timestamp order${NC}"
echo "Getting profile view..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

echo -e "\n${YELLOW}Profile page view (should be: Music, Books, Movies)${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

# Step 6: Create another shelf and see where it appears
echo -e "\n${YELLOW}Step 6: Creating a new shelf and checking its position in profile${NC}"
echo -e "${CYAN}New shelves without custom positions appear after ordered shelves, by timestamp${NC}"
echo "Creating shelf 4: Games... (newest)"
SHELF4=$(dfx canister call perpetua store_shelf '("Games", opt "My favorite games", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Shelf 4 ID: ${GREEN}$SHELF4${NC}"

# Step 7: Check where the new shelf appears
echo -e "\n${YELLOW}Step 7: Checking where the new shelf appears in profile${NC}"
echo "Getting profile view..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

echo -e "\n${YELLOW}Profile page view (should be: Music, Books, Movies, Games)${NC}"
echo -e "${CYAN}Games appears last because it has no custom position and is newest by timestamp${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

# Step 8: Set custom position for Games shelf
echo -e "\n${YELLOW}Step 8: Setting custom position for Games shelf${NC}"
echo "Moving $SHELF4 (Games) before $SHELF1 (Books)..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF4\", opt \"$SHELF1\", true)" --output idl

# Step 9: Check updated profile view
echo -e "\n${YELLOW}Step 9: Checking updated profile view${NC}"
echo "Getting profile view..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

echo -e "\n${YELLOW}Profile page view (should be: Music, Games, Books, Movies)${NC}"
echo -e "${CYAN}Now both Music and Games have custom positions, with Books/Movies still in timestamp order${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

# Step 10: Give all shelves custom positions
echo -e "\n${YELLOW}Step 10: Giving all shelves custom positions${NC}"
echo "Moving $SHELF2 (Movies) after $SHELF1 (Books)..."
dfx canister call perpetua reorder_profile_shelf "(\"$SHELF2\", opt \"$SHELF1\", false)" --output idl

# Step 11: Check final custom order with all shelves positioned
echo -e "\n${YELLOW}Step 11: Final profile view with all shelves having custom positions${NC}"
echo "Getting profile view..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

echo -e "\n${YELLOW}Final profile page view (should be: Music, Games, Books, Movies)${NC}"
echo -e "${CYAN}Now all shelves have custom positions and follow the exact order we specified${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

# Step 12: Reset the profile order to go back to timestamp
echo -e "\n${YELLOW}Step 12: Resetting profile order${NC}"
echo -e "${CYAN}This removes all custom positions and reverts to pure timestamp ordering${NC}"
echo "Resetting profile order to default..."
dfx canister call perpetua reset_profile_order "()" --output idl

# Step 13: Verify the reset (back to timestamp)
echo -e "\n${YELLOW}Step 13: Verifying reset (should be back to timestamp order)${NC}"
echo "Getting profile view after reset..."
USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
echo "$USER_SHELVES"

echo -e "\n${YELLOW}Reset profile page view (timestamp order: Books, Movies, Music, Games)${NC}"
echo -e "${CYAN}After reset, shelves are ordered purely by creation timestamp${NC}"
echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'

echo -e "\n${BLUE}=== SHELF ITEMS TEST (ADD AND REORDER) ===${NC}"

# Step 14: Create a test shelf for item operations
echo -e "\n${YELLOW}Step 14: Creating a test shelf for item operations${NC}"
echo "Creating shelf: Reading List..."
READING_SHELF=$(dfx canister call perpetua store_shelf '("Reading List", opt "Books I want to read", vec {})' --output idl | grep -o '"[^"]*"' | sed 's/"//g')
echo -e "Reading Shelf ID: ${GREEN}$READING_SHELF${NC}"

# Step 15: Add Markdown items to the shelf
echo -e "\n${YELLOW}Step 15: Adding Markdown items to the shelf${NC}"

echo "Adding item 1: The Lord of the Rings..."
dfx canister call perpetua add_item_to_shelf "(\"$READING_SHELF\", 
  record { 
    content = variant { Markdown = \"The Lord of the Rings by J.R.R. Tolkien\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

echo "Adding item 2: Dune..."
dfx canister call perpetua add_item_to_shelf "(\"$READING_SHELF\", 
  record { 
    content = variant { Markdown = \"Dune by Frank Herbert\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

echo "Adding item 3: Foundation..."
dfx canister call perpetua add_item_to_shelf "(\"$READING_SHELF\", 
  record { 
    content = variant { Markdown = \"Foundation by Isaac Asimov\" }; 
    reference_item_id = null; 
    before = true 
  })" --output idl

# Step 16: Check shelf contents
echo -e "\n${YELLOW}Step 16: Checking shelf items${NC}"
echo "Getting shelf items..."
ITEMS_RESPONSE=$(dfx canister call perpetua get_shelf_items "(\"$READING_SHELF\")" --output idl)
echo "$ITEMS_RESPONSE"

# Extract item IDs and content for better visibility
echo -e "\n${YELLOW}Initial item order:${NC}"
echo "$ITEMS_RESPONSE" | grep -E "id = |Markdown = " | paste - - | sed 's/.*id = \(.*\) :.*Markdown = \(.*\)".*/Item \1: \2"/'

# Extract item IDs using regex for reordering operations
ITEM_IDS=($(echo "$ITEMS_RESPONSE" | grep -o "id = [0-9]*" | awk '{print $3}'))
echo "Found items with IDs: ${GREEN}${ITEM_IDS[*]}${NC}"

# Step 17: Reorder items - move the last item to be first
if [ ${#ITEM_IDS[@]} -ge 3 ]; then
  echo -e "\n${YELLOW}Step 17: Reordering items - moving item ${ITEM_IDS[2]} before item ${ITEM_IDS[0]}${NC}"
  dfx canister call perpetua reorder_shelf_item "(\"$READING_SHELF\", 
    record { 
      item_id = ${ITEM_IDS[2]}; 
      reference_item_id = opt ${ITEM_IDS[0]}; 
      before = true 
    })" --output idl
else
  echo -e "\n${RED}Not enough items to reorder${NC}"
fi

# Step 18: Check updated shelf order
echo -e "\n${YELLOW}Step 18: Checking new item order${NC}"
echo "Getting shelf items again..."
ITEMS_RESPONSE=$(dfx canister call perpetua get_shelf_items "(\"$READING_SHELF\")" --output idl)
echo "$ITEMS_RESPONSE"

echo -e "\n${YELLOW}New item order (should have Foundation first):${NC}"
echo "$ITEMS_RESPONSE" | grep -E "id = |Markdown = " | paste - - | sed 's/.*id = \(.*\) :.*Markdown = \(.*\)".*/Item \1: \2"/'

# Step 19: Remove the middle item
if [ ${#ITEM_IDS[@]} -ge 2 ]; then
  echo -e "\n${YELLOW}Step 19: Removing item ${ITEM_IDS[1]}${NC}"
  dfx canister call perpetua remove_item_from_shelf "(\"$READING_SHELF\", ${ITEM_IDS[1]})" --output idl
else
  echo -e "\n${RED}Not enough items to remove one${NC}"
fi

# Step 20: Final check of shelf contents
echo -e "\n${YELLOW}Step 20: Final check of shelf contents${NC}"
echo "Getting shelf items one last time..."
ITEMS_RESPONSE=$(dfx canister call perpetua get_shelf_items "(\"$READING_SHELF\")" --output idl)
echo "$ITEMS_RESPONSE"

echo -e "\n${YELLOW}Final item order (should have Dune removed):${NC}"
echo "$ITEMS_RESPONSE" | grep -E "id = |Markdown = " | paste - - | sed 's/.*id = \(.*\) :.*Markdown = \(.*\)".*/Item \1: \2"/'

echo -e "\n${BLUE}=== TEST COMPLETE ===${NC}"
echo "Results:"
echo "1. Your principal: $PRINCIPAL"
echo "2. Created 4 shelves for profile ordering test:"
echo "   - Books: $SHELF1 (created first)"
echo "   - Movies: $SHELF2 (created second)" 
echo "   - Music: $SHELF3 (created third)"
echo "   - Games: $SHELF4 (created fourth)"
echo "3. Profile ordering tests:"
echo "   - Initial view: timestamp order (Books, Movies, Music)"
echo "   - After first reordering: Music, Books, Movies"
echo "   - After adding Games: Music, Books, Movies, Games"
echo "   - After positioning Games: Music, Games, Books, Movies"
echo "   - After positioning all shelves: Music, Games, Books, Movies"
echo "   - After reset: timestamp order (Books, Movies, Music, Games)"
echo "4. Item management tests on Reading List shelf:"
echo "   - Added 3 Markdown items"
echo "   - Reordered items (Foundation moved to first)"
echo "   - Removed Dune from the shelf"
echo -e "\nAll tests demonstrate how ordering affects what users would see on their profile and shelf pages."

# Stopper - Ask user if they want to continue with additional reordering
echo -e "\n${BLUE}=== CHECK UI AND CONTINUE? ===${NC}"
echo -e "${CYAN}Check your UI now to see the current shelf order.${NC}"
echo -e "${YELLOW}Would you like to try a different shelf order? (y/n)${NC}"
read -p "Continue with more reordering? " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
  echo -e "\n${BLUE}=== APPLYING NEW SHELF ORDER ===${NC}"
  echo -e "${CYAN}Let's create a completely different order to compare in the UI.${NC}"
  
  # First, need to reset to timestamp order to start fresh
  echo "Resetting profile order first..."
  dfx canister call perpetua reset_profile_order "()" --output idl
  
  # Now create a reversed order: Games, Music, Movies, Books
  echo -e "\n${YELLOW}Creating reverse order: Games, Music, Movies, Books${NC}"
  
  # Move Games to front
  echo "Moving $SHELF4 (Games) to front..."
  dfx canister call perpetua reorder_profile_shelf "(\"$SHELF4\", null, true)" --output idl
  
  # Move Music after Games
  echo "Moving $SHELF3 (Music) after $SHELF4 (Games)..."
  dfx canister call perpetua reorder_profile_shelf "(\"$SHELF3\", opt \"$SHELF4\", false)" --output idl
  
  # Move Movies after Music
  echo "Moving $SHELF2 (Movies) after $SHELF3 (Music)..."
  dfx canister call perpetua reorder_profile_shelf "(\"$SHELF2\", opt \"$SHELF3\", false)" --output idl
  
  # Move Books after Movies (last)
  echo "Moving $SHELF1 (Books) after $SHELF2 (Movies)..."
  dfx canister call perpetua reorder_profile_shelf "(\"$SHELF1\", opt \"$SHELF2\", false)" --output idl
  
  # Check final order
  echo -e "\n${YELLOW}Final reversed profile order:${NC}"
  echo "Getting profile view..."
  USER_SHELVES=$(dfx canister call perpetua get_user_shelves "(principal \"$PRINCIPAL\", null)" --output idl)
  
  echo -e "\n${YELLOW}New profile page view (should be: Games, Music, Movies, Books)${NC}"
  echo -e "${CYAN}This order is completely reversed from the original timestamp order${NC}"
  echo "$USER_SHELVES" | grep -E "title = |shelf_id = " | paste - - | sed 's/title = \(.*\); .*shelf_id = \(.*\);/\2 (\1)/'
  
  echo -e "\n${BLUE}=== CHECK UI AGAIN ===${NC}"
  echo -e "${CYAN}Check your UI again to see if it shows the new reversed order.${NC}"
  echo -e "${CYAN}The order should now be: Games, Music, Movies, Books${NC}"
else
  echo -e "\n${BLUE}Exiting without additional changes.${NC}"
fi