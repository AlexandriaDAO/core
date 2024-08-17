use crate::source_cards::SourceCard;
// use crate::meilisearch::MeiliSearchKeys;
use crate::engine::Engine;
use crate::librarian::Librarian;
use crate::node::Node;
// use crate::nft::TokenDetail;

use ic_cdk;
use candid::{Nat, Principal};

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

mod librarian;
pub use librarian::{
  save_librarian,
  delete_librarian,
  is_librarian,
  get_hashes_and_names,
  get_librarian,
  get_all_librarians
};

mod node;
pub use node::{
  add_node,
  add_my_node,
  update_node_status,
  delete_node,
  get_nodes,
  get_nodes_by_owner,
  get_node_by_id,
  get_my_nodes,
  get_nodes_not_owned_by,
  get_nodes_not_owned_by_me
};

mod nft_init;
pub use nft_init::{initialize_icrc7, deploy_icrc7, DeployResult};


mod nft;
pub use nft::mint_nft;

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
  