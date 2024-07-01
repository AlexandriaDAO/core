use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::convert::TryFrom;


// Helper function to determine if the caller is anonymous
fn is_anonymous(caller: Principal) -> bool {
    caller == Principal::anonymous()
}

#[derive(Clone, Copy, Debug, CandidType, Deserialize)]
pub enum BookStatus {
    Draft = 0,
    Published = 1,
}

impl TryFrom<u8> for BookStatus {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(BookStatus::Draft),
            1 => Ok(BookStatus::Published),
            _ => Err("Invalid book status".to_string()),
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Book {
    pub id: String,
    pub owner: String,


    pub engine_id: Option<String>,
    pub asset_id: Option<String>,
    pub asset_node_id: Option<String>,

    pub cover_id: Option<String>,
    pub cover_node_id: Option<String>,

    pub book_type: Option<u8>,
    pub categories: Vec<u8>,

    pub title: String,
    pub author: String,
    pub description: String,
    pub fiction: bool,
    pub pubyear: u16,
    pub language: String,
    pub publisher: String,
    pub rights: String,
    pub isbn: String,

    pub status: BookStatus,
}
impl Book {
    pub fn new() -> Self {
        let new_book = Self {
            id: Self::generate_new_id(),
            owner: caller().to_text(),
            engine_id: None,
            asset_id: None,
            asset_node_id: None,
            cover_id: None,
            cover_node_id: None,
            book_type: None,
            categories: vec![],
            title: "Title".to_string(),
            author: "Author".to_string(),
            description: "No description available".to_string(),
            fiction: false,
            pubyear: 2000,
            language: "en".to_string(),
            publisher: "Unknown Publisher".to_string(),
            rights: "No rights specified".to_string(),
            isbn: "000-0000000000".to_string(),

            status: BookStatus::Draft,
        };

        return new_book;
    }

    fn generate_new_id() -> String {
        ID_COUNTER.with(|counter| {
            let mut counter = counter.borrow_mut();
            *counter += 1;
            counter.to_string()
        })
    }

}


thread_local! {
    static BOOKS: RefCell<Vec<Book>> = RefCell::new(Vec::new());
    static ID_COUNTER: RefCell<u64> = RefCell::new(0);  // Counter for generating unique IDs
}

// Function to add a new book
#[update]
pub fn add_book(
    engine_id: String,
    asset_id: String,
    asset_node_id: String,
) -> Result<Book, String> {

    // Step 1: Make sure its not an anonymous user trying to add book
    let caller_principal = caller();
    if is_anonymous(caller_principal) {
        return Err("Anonymous users are not allowed to add books status.".to_string());
    }

    // Step 2: Basic field validations
    if engine_id.trim().is_empty() {
        return Err("Engine Id is required.".to_string());
    }

    if asset_id.trim().is_empty() {
        return Err("Asset Id is required.".to_string());
    }

    if asset_node_id.trim().is_empty() {
        return Err("Selected Node for asset is required.".to_string());
    }


    // Step 3: Create new Book
    let mut new_book = Book::new();
    new_book.engine_id = Some(engine_id);
    new_book.asset_id = Some(asset_id);
    new_book.asset_node_id = Some(asset_node_id);

    // Step 4: Push to storage
    BOOKS.with(|books| {
        books.borrow_mut().push(new_book.clone());
    });

    Ok(new_book)
}




// Function to add a new book
#[update]
pub fn add_cover(
    id: String,
    cover_id: String,
    cover_node_id: String,
) -> Result<Book, String> {
    // Step 1: Find the book by ID and check authorization
    BOOKS.with(|books| {
        let mut books = books.borrow_mut();

        if let Some(book) = books.iter_mut().find(|e| e.id == id) {
            // Step 2: Check if the caller is the owner of the book
            if book.owner != caller().to_text() {
                return Err("Unauthorized access: You do not own this book.".to_string());
            }

            // Step 3: Update the book's cover
            book.cover_id = Some(cover_id);
            book.cover_node_id = Some(cover_node_id);

            Ok(book.clone()) // Return a clone of the updated book
        } else {
            Err("Book not found.".to_string())
        }
    })
}

// Function to add a new book
#[update]
pub fn add_metadata(
    id: String,

    book_type: u8,
    categories: Vec<u8>,
    title: String,
    author: String,
    description: String,
    fiction: bool,
    pubyear: u16,
    language: String,
    publisher: String,
    rights: String,
    isbn: String,

) -> Result<Book, String> {
    // Step 1: Find the book by ID and check authorization
    BOOKS.with(|books| {
        let mut books = books.borrow_mut();

        if let Some(book) = books.iter_mut().find(|e| e.id == id) {
            // Step 2: Check if the caller is the owner of the book
            if book.owner != caller().to_text() {
                return Err("Unauthorized access: You do not own this book.".to_string());
            }

            // Step 3: Update the book's cover
            book.book_type = Some(book_type);
            book.categories = categories;
            book.title = title;
            book.author = author;
            book.description = description;
            book.fiction = fiction;
            book.pubyear = pubyear;
            book.language = language;
            book.publisher = publisher;
            book.rights = rights;
            book.isbn = isbn;
            book.status = BookStatus::Published;

            Ok(book.clone()) // Return a clone of the updated book
        } else {
            Err("Book not found.".to_string())
        }
    })
}

// // Function to delete a book by ID
// #[update]
// pub fn delete_book(book_id: String) -> bool {
//     BOOKS.with(|books| {
//         let mut books = books.borrow_mut();
//         let initial_len = books.len();
//         books.retain(|book| book.id != book_id);
//         initial_len != books.len()
//     })
// }

// Function to retrieve all books
#[query]
pub fn get_books() -> Vec<Book> {
    BOOKS.with(|books| {
        books.borrow().clone()
    })
}

// Function to get books by a specific owner
#[query]
pub fn get_books_by_owner(owner: String) -> Vec<Book> {
    BOOKS.with(|books| {
        books.borrow()
            .iter()
            .filter(|book| book.owner == owner)
            .cloned()
            .collect()
    })
}

// Function to get a specific book by ID
#[query]
pub fn get_book_by_id(book_id: String) -> Option<Book> {
    BOOKS.with(|books| {
        books.borrow()
            .iter()
            .find(|book| book.id == book_id)
            .cloned()
    })
}

// Function to get books of the calling principal, or return None if the caller is anonymous
#[query]
pub fn get_my_books() -> Vec<Book> {
    let my_principal = caller();

    if is_anonymous(my_principal) {  // Check if the principal is anonymous
        Vec::new()
    } else {
        get_books_by_owner(my_principal.to_text())
    }
}

#[query]
pub fn get_books_not_owned_by(owner: String) -> Vec<Book> {
    BOOKS.with(|books| {
        books.borrow()
            .iter()
            .filter(|book| book.owner != owner)
            .cloned()
            .collect()
    })
}

#[query]
pub fn get_books_not_owned_by_me() -> Vec<Book> {
    let my_principal = caller();
    if is_anonymous(my_principal) {
        get_books()
    }else{
        BOOKS.with(|books| {
            books.borrow()
                .iter()
                .filter(|book| book.owner != my_principal.to_text())
                .cloned()
                .collect()
        })
    }
}
