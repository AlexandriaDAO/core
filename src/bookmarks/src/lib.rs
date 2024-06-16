use ic_cdk;
use candid::Principal;
use icrc_ledger_types::icrc1::transfer::BlockIndex;

mod folders;
pub use folders::{*};

mod storage;
pub use storage::{*};

mod queries;
pub use queries::{*};

mod updates;
pub use updates::{*};

pub mod utils;

ic_cdk::export_candid!();





// Storage Canister PsuedoCode
/*
BM stands for "BookMark"

***[Functions]***

whoami() = "Returns the Principal of the caller (for testing)"
save_bm(ugbn, author, title, content, cfi) = "Creates a new BookMark and stores it in the BM map"   // Later will cost 1LBRY
delete_bm(post_id) = "Removes a BookMark from the BM map by its post_id"
get_bm(post_id) = "Retrieves a BookMark from the BM map by its post_id"
get_bm_by_title(title) = "Retrieves all BookMarks from the BM map with a matching title"
get_bm_by_author(author) = "Retrieves all BookMarks with that author.""
favorite(post_id) = "Add a bookmark to the user's favorites"                                        // Later will cost 2LBRY
remove_favorite(post_id) = "Remove a bookmark from the user's favorites"
get_user_favorites() = "Get all bookmarks for the current user"
query_bookmarks_by_title(title) = "Search bookmarks by title for the current user"

***[Data]***

BM = "bTree Map storing bookmark data for each post"
USER_FAVORITES = "HashMap storing each user's favorite posts"

[BM]
  Key: "post_id" = (consecutive interger, each post ID created increases by 1)
  Value: "BookMark Struct" [
      "owner" = (principal of the creator.)
      "ugbn" = (ID of the book NFT used)
      "cfi" = (book snippet location)
      "text" = (post content)
      "title" = (book title)
      "author" = (book author)
      "accruedBookmarks" = (amount of LBRY burned by favoriting that day)            
      "claimableBookmarks" = (amount of LBRY burned by favoriting cumulative)   // Later will be used to pay Book NFT Owners ICP. Resets Daily.
  ]

[USER_FAVORITES]
  Key: user_principal = "User's unique identifier"
  Value: favorite_ids = ["List of bookmarked post IDs"]
*/