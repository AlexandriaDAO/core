pub mod book_card;
pub mod message_card;
pub mod author_card;
pub mod types;

// #[ic_cdk::query]
// fn mc_front(query: String) -> String {
//     format!("{}", query)
// }



// use serde::Deserialize;
extern crate serde;

#[derive(Clone, Debug, candid::CandidType, serde::Deserialize)]
pub struct MessageCard {
    pub user_query: String,
    pub message: String,
}

#[ic_cdk::query]
fn mc_front(user_query: String) -> Option<MessageCard> {
    Some(MessageCard {
        user_query,
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...".to_string(),
    })
}














// use ic_cdk::export::candid::{CandidType};
// use ic_cdk::api::management_canister::http_request::{HttpHeader, HttpMethod, HttpResponse};
// use ic_cdk::export::candid::Nat;
// use ic_cdk_macros::*;
// use serde_json::json;

// #[derive(Clone, Debug, Default, CandidType)]
// pub struct SocialStats {
//     pub likes: u32,
//     pub stars: u32,
//     pub avg_rating: u32,
//     pub num_ratings: u32,
//     pub num_flags: u32,
//     pub bookmarks: u32,
// }

// #[derive(Clone, Debug, Default, CandidType)]
// pub struct BookCard {
//     pub title: String,
//     pub author: String,
//     pub heading: String,
//     pub summary: String,
//     pub content: String,
//     pub stats: SocialStats,
// }

// pub struct BookCardActor {
//     book_cards: Vec<BookCard>,
// }

// impl BookCardActor {
//     // Initialize with some default data
//     pub fn new() -> Self {
//         let default_card = BookCard {
//             title: String::from("Sample Title"),
//             author: String::from("Sample Author"),
//             heading: String::from("Sample Heading"),
//             summary: String::from("Sample Summary"),
//             content: String::from("Sample Content"),
//             stats: SocialStats::default(),
//         };

//         Self {
//             book_cards: vec![default_card.clone(), default_card.clone(), default_card],
//         }
//     }

//     #[query]
//     pub fn get_book_cards(&self) -> HttpResponse {
//         let body = serde_json::to_string(&self.book_cards).unwrap_or_else(|_| "Error converting to JSON".to_string());

//         HttpResponse {
//             status: Nat::from(200),
//             headers: vec![HttpHeader {
//                 name: "Content-Type".to_string(),
//                 value: "application/json".to_string(),
//             }],
//             body: body.as_bytes().to_vec(),
//         }
//     }
// }

// #[init]
// fn init() {
//     let actor = BookCardActor::new();
//     ic_cdk::storage::put(actor);
// }
