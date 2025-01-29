# Alex Arena

Go all in on the concept of shelves being unowned? That's fine I guess, so long as the nft in them has an owner.
The only difficulty is finding old ones/root ones.

SO how do we index all these things.
User shelves I guess. Have it be entirely profile based, and a user can rearrange their profile shelves as they see fit.

Well, likes or some kind of social metric is going to be needed. NFTs have like metrics set up, but that doesn't translate to shelves really. (I guess this could kind of happen naturally as users embed them in their shelves if it's good.)


Problem: What if everyone just uses items instead of minting their own NFTs? Do you have to like the NFT to use the item? Yeah, this is a problem.

So, items are kindof like SBTs, and users can only use their own NFTs inside them. There's gotta be a more efficient way to do this.

Notifications?


Goal:

Stable Structures Canister that stores ordered, mutable lists of NFTs & Mardown inbetween.

Programming Language: Rust.

## Data Structure

All IC Stable Structures.

### Item (all fields are optional)

What if we scratch the idea of items, and just do NFT Ids?

The writing could be stored as part of the Shelf itself. No decorating NFTs themselves.
<!-- (K:1) Principal -> BTreeSet<(nanos: Nat, item_id)> // Ordered by IC system time (nanoseconds)

(V:1) it_id
(V:2) Title
(V:3) Description
(V:4) Author
(V:5) Optional NFT/SBT ID -->

### Shelf

(K:1) Principal -> BTreeSet<(nanos: Nat, shelf_id)> // Ordered by IC system time (nanoseconds)

(V:1) sh_id
(V:2) Title
(V:3) Description
(V:4) Author
(V:5) [it_id, it_id, it_id]

Max 100 items per shelf.


## Utility Functions:

GenerateID(type: Shelf | Item) -> String
  // Structure: type_prefix + separator + composite_hash
  // Shelf: "sh" + 12 character base58 (timestamp + principal + random)
  // Item:  "it" + 16 character base58 (shelf_id + timestamp + random)
  // Uses IC's cryptographically secure random bytes
  // Base58 for URL-safety and human-readability (avoid 0/O/I/l confusion)

verify_shelf_ownership(shelf_id: String) -> Result<Shelf, Error>
  if shelf exists:
    if shelf.author == caller:
      return okay
    else:
      return error
  else:
    return error

verify_item(item_id: String) -> Result<Item, Error>
  if item exists:
    if item_id has NFT:
      return verify_nft_owner(nft_id, collection)
    else:
      return okay
  else:
    return error

verify_nft_owner(nft_id: Nat, collection: String) -> Result<(), Error>
  // Verify caller owns NFT via collection.icrc7_owner_of()
  // Return success or error






add_item_to_shelf(item_id: String, shelf_id: String) -> Result<(), Error>

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
  let shelf = verify_shelf_ownership(id, caller_principal)?  // Replaces manual checks
  // Delete the shelf

#[update]
addToShelf(id: string)
  if item_id:
    if item_d
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
  if let Some(nft_id) = nft {
    verify_nft_owner(nft_id, caller_principal)?  // Replaces manual check
  }
  // Rest of implementation

#[derive(Debug, Clone)]
struct ItemUpdate {
    title: Option<String>,
    description: Option<String>,
    nft: Option<Option<Nat>>,  // None = don't update, Some(None) = remove NFT, Some(Some(id)) = new NFT
}

#[update]
UpdateItem(item_id: String, updates: ItemUpdate)
  let item = verify_item_exists(item_id)?  // Combined existence check
  verify_shelf_ownership(item.shelf_id, caller_principal)?  // Verify ownership
  // Rest of implementation





#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront.

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 items.

You don't save Shelfs, you add them to your own shelfs.

The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.