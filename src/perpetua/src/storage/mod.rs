// src/perpetua/src/storage/mod.rs

use ic_stable_structures::memory_manager::{MemoryManager, VirtualMemory, MemoryId as ActualMemoryId};
use ic_stable_structures::DefaultMemoryImpl;
use std::cell::RefCell;

// Define Memory type alias here, accessible within the storage module
pub(crate) type Memory = VirtualMemory<DefaultMemoryImpl>;

// Re-export MemoryId for use within the storage submodules
pub(crate) type MemoryId = ActualMemoryId;

thread_local! {
    // Memory manager for stable storage, accessible within the storage module
    pub(crate) static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
}

// Declare submodules
pub mod common_types;
pub mod shelf_storage;
pub mod tag_storage;
pub mod user_storage;
pub mod nft_storage;
pub mod follow_storage;
pub mod random_feed_storage;

// Re-export key types/structs for easier access from outside crate::storage
pub use common_types::{
    ShelfId, NormalizedTag, ItemId,
    // Centralized constants
    MAX_NFT_ID_LENGTH,
    MAX_TAGS_PER_SHELF,
    MAX_ITEMS_PER_SHELF,
    MAX_APPEARS_IN_COUNT,
    MAX_MARKDOWN_LENGTH,
    SHELF_ITEM_STEP_SIZE
};

pub use shelf_storage::{
    // Statics (Maps)
    SHELF_DATA, GLOBAL_TIMELINE,
    // Structs
    Shelf, ShelfData, ShelfMetadata, ShelfContent, ShelfContentSerializable, Item, ItemContent,
    GlobalTimelineItemValue, ShelfPublic, ShelfBackupData,
    // Functions
    create_shelf,
    // Constants - Removed as they are now in common_types
    // Memory IDs (made pub(crate) in their modules, re-export if needed publicly)
};

pub use tag_storage::{
    // Statics (Maps)
    TAG_METADATA, TAG_SHELF_ASSOCIATIONS, SHELF_TAG_ASSOCIATIONS,
    TAG_POPULARITY_INDEX, TAG_LEXICAL_INDEX,
    TAG_SHELF_CREATION_TIMELINE_INDEX,
    // Structs
    TagMetadata, ShelfTagAssociationKey, TagShelfCreationTimelineKey,
    // Functions
    validate_tag_format,
    // Constants
    MAX_TAG_LENGTH, // MAX_TAGS_PER_SHELF removed, now in common_types
};

pub use user_storage::{
    // Statics (Maps)
    USER_SHELVES, USER_PROFILE_ORDER,
    // Structs
    TimestampedShelves, UserProfileOrder, UserProfileOrderSerializable,
};

pub use nft_storage::{
    // Statics (Maps)
    NFT_SHELVES,
    // Structs
    StringVec,
    // Constants - MAX_NFT_ID_LENGTH removed, now in common_types
};

pub use follow_storage::{
    // Statics (Maps)
    FOLLOWED_USERS, FOLLOWED_TAGS,
    // Structs
    PrincipalSet, NormalizedTagSet,
};

pub use random_feed_storage::{
    // Statics (Maps)
    RANDOM_SHELF_CANDIDATES,
    // Functions
    refresh_random_shelf_candidates,
};

// Re-export MemoryId constants if they need to be accessed from outside the storage module directly.
// Generally, it's cleaner if only the maps/functions are the public API.
// For now, MemoryId constants are pub(crate) within their respective modules. 