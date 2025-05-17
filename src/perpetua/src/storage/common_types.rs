pub type ShelfId = String;
pub type NormalizedTag = String;
pub type ItemId = u32;

// --- Centralized Constants ---
pub const MAX_NFT_ID_LENGTH: usize = 100;
pub const MAX_TAGS_PER_SHELF: usize = 3;
pub const MAX_ITEMS_PER_SHELF: usize = 500;
pub const MAX_APPEARS_IN_COUNT: usize = 100;
pub const MAX_MARKDOWN_LENGTH: usize = 1_000;
pub const SHELF_ITEM_STEP_SIZE: f64 = 1000.0; 