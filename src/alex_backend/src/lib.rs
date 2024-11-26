use crate::source_cards::SourceCard;
// use crate::meilisearch::MeiliSearchKeys;
// use crate::nft::TokenDetail;

use ic_cdk;
use candid::{Nat, Principal};

mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};


mod wallet_keys;
pub use wallet_keys::*;


// mod nft_init;
// pub use nft_init::{initialize_icrc7, deploy_icrc7, DeployResult};


// mod nft;
// pub use nft::*;

ic_cdk::export_candid!();



// // Example of the keys that will be accepted.
// // MEILI_DOMAIN = 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
// // MEILI_MASTER_KEY = '85238b14-cf2f-4066-a822-bd2b4dd18de0',


// #[query]
// pub fn whoami(name: String) -> String {
  //     format!("Logged in with Principal: {}!", name)
  // }

  // #[update]
// fn save_meilisearch_keys(name: String, MEILI_DOMAIN: String, MEILI_MASTER_KEY: String) -> () {
  //   Save MEILI_DOMAIN: String, MEILI_MASTER_KEY: String associated with that principal.
  // }
  
// #[query]
// fn get_meilisearch_keys(name: String) -> {
  //   return MEILI_DOMAIN: String, MEILI_MASTER_KEY: String
  // }
  