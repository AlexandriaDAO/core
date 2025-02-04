# Lexigraph App

Goal: A social app for NFT Grids, doubling as a full blogging platform.

Stable Structures Canister that stores ordered, mutable lists of NFTs.

Programming Language: Rust.

## Features

Full blogs all on-chain.
Full NFT grids (shelves).
Fully dynamic, i.e., unlimited editing of ones own stuff.

### UX/UI Feature TODO

Link navigation is always lbry.app/app/user/<shelf_id>/<nft_id>
  - Going back to user shows their shelves.
  - Clicking on any shelf inside a shelf takes you to that shelf: /app/user/<shelf_id>

Blog View:
  - Switch from the table to show the markdown style blog with the NFTs inside.


### Future Possible Features

- Shelf Appears In? YES
- Allowed to edit others users' shelves? NO

## Design

All IC Stable Structures, for V1 only owners can edit shelves.

## Utility Functions:

GenerateID() -> sh_<12chars>

verify_shelf_ownership(shelf_id: String) -> Result<Shelf, Error>
  if shelf.author == caller:
    return okay
  else:
    return error

verify_nft_owner(nft_id: Nat, collection: String) -> Result<(), Error>
  if caller == collection.icrc7_owner_of(nft_id):
    return okay
  else:
    return error


## storage.rs:

### Shelf Structure

(V:1) shelf_id: String
(V:2) title: String
(V:3) description: Option<String>
(V:4) owner: Principal
(V:5) slots: BTreeMap<u32, Slot>  // Slots stored by ID
(V:6) slot_order: BTreeMap<u32, u32>  // Map: position -> slot_id
(V:7) created_at: u64
(V:8) updated_at: u64

### Slot Structure

id: u32  // Unique slot ID
content: SlotContent  // Either NFT(String) or Markdown(String)
position: u32  // Display order

### Storage Maps

(K:1) Principal -> TimestampedShelves(BTreeSet<(nanos: u64, shelf_id)>)  // USER_SHELVES
(K:2) shelf_id -> Shelf  // SHELVES
(K:3) nft_id -> StringVec(Vec<shelf_id>)  // NFT_SHELVES

### Functions

store_shelf(owner: Principal, title: String, description: Option<String>, slots: Vec<Slot>) -> Result<(), String>
  // Generate new shelf_id
  // Create shelf with current timestamp
  // Add slots with proper ordering
  // Update NFT_SHELVES for any NFT slots
  // Store shelf in SHELVES map
  // Add to user's shelf set in USER_SHELVES

update_shelf(shelf_id: String, updates: ShelfUpdate) -> Result<(), String>
  // Verify caller is shelf owner
  // Update title if provided
  // Update description if provided
  // If slots updated:
    // Track NFT reference changes
    // Remove old NFT references from NFT_SHELVES
    // Add new NFT references to NFT_SHELVES
    // Update shelf slots
  // Set updated_at to current time

### ShelfUpdate Structure

title: Option<String>
description: Option<String>
slots: Option<Vec<Slot>>

## shelf.rs

#[update]
CreateShelf(title: String, description: Option<String>, nft_ids: Option<Vec<Nat>>, blog_view: Option<Vec<String>>)
  let shelf_id = generate_id()
  let owner = ic_cdk::caller();
  store_shelf(shelf_id, title, description, owner, nft_ids, blog_view)


#[update]
add_nft_to_shelf(nft_id: String, shelf_id: String, slot: Nat) -> Result<(), Error>


## query.rs

#[query]
get_user_shelves_range(user: Principal, start_index: u32, end_index: u32)
  // Get shelves for user within the specified range (1-based index)
  // Returns ordered list of shelves from oldest to newest
  // Efficient range queries using BTreeSet skip/take

#[update]
DeleteShelf(id: String)
  let shelf = verify_shelf_ownership(id, caller_principal)?  // Replaces manual checks
  // Delete the shelf

#[update]
addToShelf(id: string)
  if nft_id:
    if nft_d
#[update]
rearrangeShelf(shelf_id: String, nft_id: String, new_index: u32)
  // Check if the shelf exists
  // Check if caller is the author
  // Check if nft_id exists in the shelf
  // Move the nft to the new_index position, shifting other nfts as needed

## Nft Functions

#[update]
CreateNft(title: String, description: String, nft: Option<Nat>)
  // Check Character Limits
  if let Some(nft_id) = nft {
    verify_nft_owner(nft_id, caller_principal)?  // Replaces manual check
  }
  // Rest of implementation

#[derive(Debug, Clone)]
struct NftUpdate {
    title: Option<String>,
    description: Option<String>,
    nft: Option<Option<Nat>>,  // None = don't update, Some(None) = remove NFT, Some(Some(id)) = new NFT
}

#[update]
UpdateNft(nft_id: String, updates: NftUpdate)
  let nft = verify_nft_owner(nft_id)?  // Combined existence check
  verify_shelf_ownership(nft.shelf_id, caller_principal)?  // Verify ownership
  // Rest of implementation





#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront.

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 nfts.

You don't save Shelfs, you add them to your own shelfs.

The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.
