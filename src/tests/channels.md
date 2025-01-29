# Alex Arena

Goal:

Stable Structures Canister that stores ordered, mutable lists of NFTs & Mardown inbetween.

Programming Language: Rust.

## Data Structure

All IC Stable Structures.

### Item (all fields are optional)

(1) ID
(2) Title
(3) Description
(4) Author
(5) Optional NFT/SBT ID

### Shelf

(1) Principal -> BTreeSet<(nanos: Nat, shelf_id)>
    // Ordered by IC system time (nanoseconds)
    // No state to maintain
    // Natural ordering with meaningful timestamps
    // Enables pagination and ordered access to user's shelves

(1) ID
(2) Title
(3) Description
(4) Author
(5) Items List

Max 100 items per shelf.

## Utility Functions:

GenerateID(type: Shelf | Item)
  // Generate random, collision resistant string/hash.
  // Fixed length. Less digits for shelf, more for items.


## Shelf Functions

#[query]
get_user_shelves_range(user: Principal, start_index: u32, end_index: u32)
  // Get shelves for user within the specified range (1-based index)
  // Returns ordered list of shelves from oldest to newest
  // Efficient range queries using BTreeSet skip/take

#[update]
CreateShelf(title: String, description: Option<String>)
  // Generate a new ID for the shelf.
  // Populate the title/description/author (caller_principal).
  // Initiate the shelf with an empty list.

#[update]
DeleteShelf(id: String)
  // Check if the shelf exists.
  // Check if the caller is the author.
  // Delete the shelf.


#[update]
addToShelf(id: string)
  // Check if the shelf exists.
  // Check if the caller is the author.
  // Check if the item exists.
  // Check if the item is not already in the shelf.
  // Add the item to the shelf.


#[update]
rearrangeShelf(shelf_id: String, item_id: String, new_index: u32)
  // Check if the shelf exists
  // Check if caller is the author
  // Check if item_id exists in the shelf
  // Move the item to the new_index position, shifting other items as needed


## Item Functions

#[update]
CreateItem(title: String, description: String, nft: Option<Nat>)
  // Check Character Limits
  // If nft is provided, ensure they are the owner of the NFT (icrc7_owner_of())
  // Adds the itemId to the shelf list.

#[derive(Debug, Clone)]
struct ItemUpdate {
    title: Option<String>,
    description: Option<String>,
    nft: Option<Option<Nat>>,  // None = don't update, Some(None) = remove NFT, Some(Some(id)) = new NFT
}

#[update]
UpdateItem(item_id: String, updates: ItemUpdate)
    // Check if the item exists
    // Check if caller is the author
    // For each provided field in updates:
    //   - If title: Some(value) -> validate character limits
    //   - If description: Some(value) -> validate character limits
    //   - If nft: 
    //     * Some(Some(nft_id)) -> verify caller owns the NFT via icrc7_owner_of()
    //     * Some(None) -> remove NFT association
    //     * None -> keep existing NFT unchanged
    // Apply all validated updates atomically
    // Return updated item















#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront. 

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 items.





?ForkShelf()


You don't save Shelfs, you add them to your own shelfs.


The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.