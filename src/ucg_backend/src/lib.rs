use crate::source_cards::SourceCard;
// use crate::meilisearch::MeiliSearchKeys;
use crate::engine::Engine;


use ic_cdk;
use candid::Principal;

mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};


mod engine;
pub use engine::{
  add_engine,
  add_my_engine,
  update_engine_status,
  delete_engine,
  get_engines,
  get_engines_by_owner,
  get_engine_by_id,
  get_my_engines,
  get_engines_not_owned_by,
  get_engines_not_owned_by_me
};

mod wallet_keys;
pub use wallet_keys::*;

ic_cdk::export_candid!();


// // Example of the keys that will be accepted.
// // MEILI_DOMAIN = 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
// // MEILI_MASTER_KEY = '85238b14-cf2f-4066-a822-bd2b4dd18de0',


  
/*
So I just need call this function with the token id of the arweave file.
# Mint a token.
dfx canister call ucg_nft mint \
    "(record{
        token_id=1;
        holders=vec{record{owner=principal\"$YOU\"}}
    })"




*/
