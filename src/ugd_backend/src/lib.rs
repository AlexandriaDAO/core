mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};

mod weaviate;
pub use weaviate::get_weaviate_query;

#[ic_cdk::query]
fn whoami(name: String) -> String {
    format!("Hello there, {}!", name)
}