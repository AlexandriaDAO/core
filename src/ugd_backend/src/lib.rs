pub mod book_card;
pub mod message_card;
pub mod author_card;
pub mod types;


#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// // #[Counter Main Docs]

// use std::cell::RefCell;
// use candid::types::number::Nat;

// thread_local! {
//     static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
// }

// /// Get the value of the counter.
// #[ic_cdk_macros::query]
// fn get() -> Nat {
//     COUNTER.with(|counter| (*counter.borrow()).clone())
// }

// /// Set the value of the counter.
// #[ic_cdk_macros::update]
// fn set(n: Nat) {
//     // COUNTER.replace(n);  // requires #![feature(local_key_cell_methods)]
//     COUNTER.with(|count| *count.borrow_mut() = n);
// }

// /// Increment the value of the counter.
// #[ic_cdk_macros::update]
// fn inc() {
//     COUNTER.with(|counter| *counter.borrow_mut() += 1);
// }



// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_get_set() {
//         let expected = Nat::from(42);
//         set(expected.clone());
//         assert_eq!(get(), expected);
//     }

//     #[test]
//     fn test_init() {
//         assert_eq!(get(), Nat::from(0));
//     }

//     #[test]
//     fn test_inc() {
//         for i in 1..10 {
//             inc();
//             assert_eq!(get(), Nat::from(i));
//         }
//     }
// }







// // #[hello test]

// use ic_cdk::export::candid::Nat;
// use ic_cdk::api::management_canister::http_request::{HttpHeader, HttpResponse};

// #[ic_cdk::query]
// fn search(input: String) -> HttpResponse {
//     let body = format!("Hello {}", input);
//     HttpResponse {
//         status: Nat::from(200),
//         headers: vec![HttpHeader {
//             name: "Content-Type".to_string(),
//             value: "text/plain".to_string(),
//         }],
//         body: body.as_bytes().to_vec(),
//     }
// }

// // #[counter_test]
// use ic_cdk::{
//     api::call::ManualReply,
//     export::{candid, Principal},
//     init, query, update,
// };
// use std::cell::{Cell, RefCell};

// thread_local! {
//     static COUNTER: RefCell<candid::Nat> = RefCell::new(candid::Nat::from(0));
//     static OWNER: Cell<Principal> = Cell::new(Principal::from_slice(&[]));
// }

// #[init]
// fn init() {
//     OWNER.with(|owner| owner.set(ic_cdk::api::caller()));
// }

// #[update]
// fn inc() {
//     ic_cdk::println!("{:?}", OWNER.with(|owner| owner.get()));
//     COUNTER.with(|counter| *counter.borrow_mut() += 1u64);
// }

// #[query(manual_reply = true)]
// fn read() -> ManualReply<candid::Nat> {
//     COUNTER.with(|counter| ManualReply::one(counter))
// }

// #[update]
// fn write(input: candid::Nat) {
//     COUNTER.with(|counter| *counter.borrow_mut() = input);
// }









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
