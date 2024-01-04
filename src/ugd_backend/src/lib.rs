mod source_cards;
pub use source_cards::{save_sc, bookmark_sc, delete_sc, get_sc, get_bookmarks};

mod weaviate;
pub use weaviate::get_weaviate_query;

#[ic_cdk::query]
pub fn whoami(name: String) -> String {
    format!("Logged in with Principal: {}!", name)
}



// Notes on Whitepaper Outline with respect to Rust Backend Implementation

// Current Litepaper Structure:
// LitePaper
//   Project Concept
//     Problem
//     Solution
//     Then Internet of Books 

//   Tokenomics
//     Distribution
//     Utility
//     Revenue
//     Rewards

//   Inspiration



// I need to introduce a user flow section. 
// Books are uploaded as NFTs. 
// User starts with a search bar, semantically searches all book snippets as a result.
// These book snippets are combined with AI to create posts.

// These happen to be the 4 main components that need to be built out.

// So for how this works:
// Brief overview of what the user sees.
// 1. Books (NFTs)
//   - a raw .epub of course.
//   - Upgradable metadata (title, author, cover image, categories, description, usage stats.)
//   - a .csv with all the metadata from an epub.js parser
// 2. Search (Vector DB)
//   - A vector db with all the book nft csvs. Filters configured to these different VectorDBs.
//   - A complex algorithmic setup that decides what book/category databases to query. This will likely look like some kind of heirarchy of centroid/quantized vectorDBs.
// 3. Post Creator (AI)
//   - Adaptable Cansiter or set of canisters.
//   - A set of AI models that designed to 'decorate' Posts with upgrades.
// 4. Posts (SBTs).
//   - Like an NFT but adds special attributes unique to you, always adaptable as you add and change stuff.
//   - Upgradable build your own kind of thing (UI Challenge).



// Offchain Endevour: 
// - Everything to Epub converter portal.
