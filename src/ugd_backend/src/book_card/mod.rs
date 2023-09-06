// // src/ugd_backend/book_card/mod.rs

// use crate::types;

// pub struct BookCardActor {
//     book_cards: Vec<types::BookCard>,
// }

// impl BookCardActor {
//     pub async fn get_book_cards(&self) -> Vec<types::BookCard> {
//         self.book_cards.clone()
//     }

//     pub async fn add_book_card(&mut self, new_card: types::BookCard) {
//         let default_card = types::BookCard {
//             title: String::from("Fake title to later be generated dynamically"),
//             author: new_card.author,
//             heading: String::from("Page: Ipsum dolor"),
//             summary: String::from("Summary of Lorem ipsum dolor sit amet"),
//             content: String::from("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
//             stats: types::SocialStats { bookmarks: 0, ..Default::default() },
//         };
//         self.book_cards.push(default_card);
//     }
// }






