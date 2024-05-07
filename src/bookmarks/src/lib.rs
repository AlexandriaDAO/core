
// mod bookmarks;
// pub use bookmarks::{*};

// mod favorites;
// pub use favorites::{*};







// // The cargo.toml with conflicting packgage that we need to use `mod favorites`

// [package]
// name = "bookmarks"
// version = "0.1.0"
// edition = "2021"

// [lib]
// crate-type = ["cdylib"]

// [dependencies]
// candid = "0.10.8"
// ciborium = "0.2.2"
// ic-ledger-types = "0.10.0"
// icrc-ledger-types = "0.1.5"
// ic-cdk = "0.13.2"
// ic-cdk-macros = "0.13.2"
// ic-cdk-timers = "0.7.0"
// serde_json = "1.0"
// ic-stable-structures = "0.6.4"
// serde = { version = "1.0", features = ["derive"] }








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







// // Token transfer code. I meant to use this to test a transfer call of a user that approved tokens to this canister, but there are insurmountable cargo.toml conflicts right now.

// use candid::{CandidType, Deserialize, Principal};
// use icrc_ledger_types::icrc1::account::Account;
// use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};
// use serde::Serialize;

// #[derive(CandidType, Deserialize, Serialize)]
// pub struct TransferArgs {
//     amount: NumTokens,
//     to_account: Account,
// }

// #[ic_cdk::update]
// async fn transfer(args: TransferArgs) -> Result<BlockIndex, String> {
//     ic_cdk::println!(
//         "Transferring {} tokens to account {}",
//         &args.amount,
//         &args.to_account,
//     );

//     let transfer_args: TransferArg = TransferArg {
//         // can be used to distinguish between transactions
//         memo: None,
//         // the amount we want to transfer
//         amount: args.amount,
//         // we want to transfer tokens from the default subaccount of the canister
//         from_subaccount: None,
//         // if not specified, the default fee for the canister is used
//         fee: None,
//         // the account we want to transfer tokens to
//         to: args.to_account,
//         // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
//         created_at_time: None,
//     };

//     // 1. Asynchronously call another canister function using `ic_cdk::call`.
//     ic_cdk::call::<(TransferArg,), (Result<BlockIndex, TransferError>,)>(
//         // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
//         //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
//         Principal::from_text("hdtfn-naaaa-aaaam-aciva-cai")
//             .expect("Could not decode the principal."),
//         // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
//         "icrc1_transfer",
//         // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
//         (transfer_args,),
//     )
//     .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
//     // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
//     //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
//     //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
//     .map_err(|e| format!("failed to call ledger: {:?}", e))?
//     // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
//     .0
//     // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
//     .map_err(|e| format!("ledger transfer error {:?}", e))
// }




  
  
  



