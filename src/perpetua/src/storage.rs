use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;
use crate::ordering::PositionTracker; // Import the new tracker
use crate::utils::normalize_tag; // Import the normalization function
use crate::types::{TagPopularityKey, TagShelfAssociationKey}; // Import from new types module
use sha2;
use bs58;
use std::cmp::Ordering; // Import Ordering for custom Ord impl

// Remove the duplicate definition from here, keep the one in utils.rs
// /// Normalizes a tag by converting to lowercase, trimming whitespace
// /// This helps prevent duplicates with minor variations
// pub fn normalize_tag(tag: &str) -> String {
//     tag.trim().to_lowercase()
// }

type Memory = VirtualMemory<DefaultMemoryImpl>;

// --- Define ShelfId and NormalizedTag types ---
pub type ShelfId = String; 
pub type NormalizedTag = String;
pub type ItemId = u32; // Define ItemId here

// --- Define TagMetadata ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TagMetadata {
    pub current_shelf_count: u64,
    pub first_seen_timestamp: u64, // Nanoseconds
    pub last_association_timestamp: u64, // Nanoseconds
    pub last_active_timestamp: u64, // Nanoseconds (updated on add or remove)
}

// Storable implementation for TagMetadata
impl Storable for TagMetadata {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded; // Assuming size can vary
}

// --- Wrapper Structs for Storable Tuples and Vec ---

#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct ShelfTagAssociationKey(pub ShelfId, pub NormalizedTag);

impl Storable for ShelfTagAssociationKey {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0, &self.1).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let (shelf_id, tag) = Decode!(bytes.as_ref(), ShelfId, NormalizedTag).unwrap();
        Self(shelf_id, tag)
    }
    const BOUND: Bound = Bound::Unbounded;
}
impl PartialOrd for ShelfTagAssociationKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}
impl Ord for ShelfTagAssociationKey {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.0.cmp(&other.0) {
            Ordering::Equal => self.1.cmp(&other.1),
            other => other,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct OrphanedTagValue(pub Vec<NormalizedTag>);

impl Storable for OrphanedTagValue {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let tags = Decode!(bytes.as_ref(), Vec<NormalizedTag>).unwrap();
        Self(tags)
    }
    const BOUND: Bound = Bound::Unbounded;
}


// Memory IDs for different storage maps
const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);
const GLOBAL_TIMELINE_MEM_ID: MemoryId = MemoryId::new(3);
// Removed old tag map IDs (4-7, 9)
const USER_PROFILE_ORDER_MEM_ID: MemoryId = MemoryId::new(8);
// --- New Tag System Memory IDs (start from 10) ---
const TAG_METADATA_MEM_ID: MemoryId = MemoryId::new(10);
const TAG_SHELF_ASSOCIATIONS_MEM_ID: MemoryId = MemoryId::new(11);
const SHELF_TAG_ASSOCIATIONS_MEM_ID: MemoryId = MemoryId::new(12);
const TAG_POPULARITY_INDEX_MEM_ID: MemoryId = MemoryId::new(13);
const TAG_LEXICAL_INDEX_MEM_ID: MemoryId = MemoryId::new(14);
const ORPHANED_TAG_CANDIDATES_MEM_ID: MemoryId = MemoryId::new(15);
// --- Follow System Memory IDs ---
const FOLLOWED_USERS_MEM_ID: MemoryId = MemoryId::new(16);
const FOLLOWED_TAGS_MEM_ID: MemoryId = MemoryId::new(17);


// Constants for shelf operations
pub const MAX_ITEMS_PER_SHELF: usize = 500;
pub const MAX_APPEARS_IN_COUNT: usize = 100; // Keep this if relevant elsewhere
// --- Define new constants ---
pub const MAX_TAG_LENGTH: usize = 25; // Adjusted max tag length
pub const MAX_TAGS_PER_SHELF: usize = 3; // Adjusted max tags per shelf
pub const MAX_NFT_ID_LENGTH: usize = 100; // Max length for NFT IDs
pub const MAX_MARKDOWN_LENGTH: usize = 10_000; // Max length for Markdown content

// New wrapper types (Keep these if used outside tags)
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct StringVec(pub Vec<String>);

#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TimestampedShelves(pub BTreeSet<(u64, ShelfId)>);

// Add back the ItemContent and Item types
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ItemContent {
    Nft(String), // NFT ID
    Markdown(String), // Markdown text
    Shelf(ShelfId), // Shelf ID - allows nesting shelves
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Item {
    pub id: u32, // Unique item ID
    pub content: ItemContent,
}

thread_local! {
    // Memory manager for stable storage
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // Main shelves storage: K: shelf_id, V: Shelf
    pub static SHELVES: RefCell<StableBTreeMap<ShelfId, Shelf, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(SHELVES_MEM_ID))
        )
    );

    // User shelves index: K: Principal, V: TimestampedShelves
    pub static USER_SHELVES: RefCell<StableBTreeMap<Principal, TimestampedShelves, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_SHELVES_MEM_ID))
        )
    );

    // NFT shelves index: K: nft_id, V: StringVec
    pub static NFT_SHELVES: RefCell<StableBTreeMap<String, StringVec, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(NFT_SHELVES_MEM_ID))
        )
    );
    
    // Global timeline index: K: timestamp, V: shelf_id
    pub static GLOBAL_TIMELINE: RefCell<StableBTreeMap<u64, ShelfId, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GLOBAL_TIMELINE_MEM_ID))
        )
    );
    
    // User profile shelf order: K: Principal, V: UserProfileOrder
    pub static USER_PROFILE_ORDER: RefCell<StableBTreeMap<Principal, UserProfileOrder, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_PROFILE_ORDER_MEM_ID))
        )
    );
    
    // --- New Tag System Maps ---
    pub static TAG_METADATA: RefCell<StableBTreeMap<NormalizedTag, TagMetadata, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_METADATA_MEM_ID))
        )
    );

    pub static TAG_SHELF_ASSOCIATIONS: RefCell<StableBTreeMap<TagShelfAssociationKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_SHELF_ASSOCIATIONS_MEM_ID))
        )
    );

    pub static SHELF_TAG_ASSOCIATIONS: RefCell<StableBTreeMap<ShelfTagAssociationKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(SHELF_TAG_ASSOCIATIONS_MEM_ID))
        )
    );

    pub static TAG_POPULARITY_INDEX: RefCell<StableBTreeMap<TagPopularityKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_POPULARITY_INDEX_MEM_ID))
        )
    );

    pub static TAG_LEXICAL_INDEX: RefCell<StableBTreeMap<NormalizedTag, (), Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_LEXICAL_INDEX_MEM_ID))
        )
    );

    // Using Vec<NormalizedTag> as the value type for Orphaned Tag Candidates
    pub static ORPHANED_TAG_CANDIDATES: RefCell<StableBTreeMap<u64, OrphanedTagValue, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(ORPHANED_TAG_CANDIDATES_MEM_ID))
        )
    );

    // --- Follow System Maps ---
    pub static FOLLOWED_USERS: RefCell<StableBTreeMap<Principal, PrincipalSet, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(FOLLOWED_USERS_MEM_ID))
        )
    );

    pub static FOLLOWED_TAGS: RefCell<StableBTreeMap<Principal, NormalizedTagSet, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(FOLLOWED_TAGS_MEM_ID))
        )
    );
}

// --- Serializable version of Shelf --- Must derive CandidType and Deserialize
#[derive(CandidType, Deserialize, Clone, Debug)]
struct ShelfSerializable {
    shelf_id: ShelfId,
    title: String,
    description: Option<String>,
    owner: Principal,
    editors: Vec<Principal>,
    items: BTreeMap<u32, Item>,
    // Store positions as a Vec for serialization
    item_positions: Vec<(u32, f64)>, 
    created_at: u64,
    updated_at: u64,
    appears_in: Vec<ShelfId>,
    tags: Vec<NormalizedTag>,
    is_public: bool,
}

// --- Main Shelf struct using PositionTracker --- 
// Does NOT derive CandidType/Deserialize directly because PositionTracker isn't Candid
#[derive(/* Remove CandidType, Deserialize here */ Clone, Debug)] 
pub struct Shelf {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub editors: Vec<Principal>,      
    pub items: BTreeMap<u32, Item>,      
    // Use PositionTracker now
    pub item_positions: PositionTracker<u32>, 
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,         
    pub tags: Vec<NormalizedTag>,         
    pub is_public: bool,                  
}

// --- Manual Storable implementation for Shelf --- Needs Encode/Decode
impl Storable for Shelf {
    fn to_bytes(&self) -> Cow<[u8]> {
        let serializable = ShelfSerializable {
            shelf_id: self.shelf_id.clone(),
            title: self.title.clone(),
            description: self.description.clone(),
            owner: self.owner.clone(),
            editors: self.editors.clone(),
            items: self.items.clone(),
            // Convert tracker to Vec for serialization
            item_positions: self.item_positions.get_ordered_entries(), 
            created_at: self.created_at,
            updated_at: self.updated_at,
            appears_in: self.appears_in.clone(),
            tags: self.tags.clone(),
            is_public: self.is_public,
        };
        // Use Encode! from candid library
        Cow::Owned(Encode!(&serializable).expect("Failed to encode ShelfSerializable"))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Use Decode! from candid library
        let serializable: ShelfSerializable = Decode!(bytes.as_ref(), ShelfSerializable).expect("Failed to decode ShelfSerializable");
        
        // Rebuild PositionTracker from Vec
        let mut item_positions = PositionTracker::<u32>::new();
        for (key, pos) in serializable.item_positions {
            item_positions.insert(key, pos);
        }

        Self {
            shelf_id: serializable.shelf_id,
            title: serializable.title,
            description: serializable.description,
            owner: serializable.owner,
            editors: serializable.editors,
            items: serializable.items,
            item_positions, // Assign the rebuilt tracker
            created_at: serializable.created_at,
            updated_at: serializable.updated_at,
            appears_in: serializable.appears_in,
            tags: serializable.tags,
            is_public: serializable.is_public,
        }
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Item {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for StringVec {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for TimestampedShelves {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// --- Serializable version of UserProfileOrder --- Must derive CandidType and Deserialize
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
struct UserProfileOrderSerializable {
    // Store positions as a Vec for serialization
    shelf_positions: Vec<(ShelfId, f64)>,
    is_customized: bool,
}

// --- Main UserProfileOrder struct using PositionTracker ---
// Does NOT derive CandidType/Deserialize directly
#[derive(/* Remove CandidType, Deserialize here */ Clone, Debug, Default)]
pub struct UserProfileOrder {
    // Use PositionTracker now
    pub shelf_positions: PositionTracker<ShelfId>,
    pub is_customized: bool,
}

// --- Manual Storable implementation for UserProfileOrder --- Needs Encode/Decode
impl Storable for UserProfileOrder {
     fn to_bytes(&self) -> Cow<[u8]> {
        let serializable = UserProfileOrderSerializable {
            // Convert tracker to Vec for serialization
             shelf_positions: self.shelf_positions.get_ordered_entries(),
             is_customized: self.is_customized,
         };
         // Use Encode! from candid library
         Cow::Owned(Encode!(&serializable).expect("Failed to encode UserProfileOrderSerializable"))
     }

     fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Use Decode! from candid library
         let serializable: UserProfileOrderSerializable = Decode!(bytes.as_ref(), UserProfileOrderSerializable).expect("Failed to decode UserProfileOrderSerializable");
        
         // Rebuild PositionTracker from Vec
         let mut shelf_positions = PositionTracker::<ShelfId>::new();
         for (key, pos) in serializable.shelf_positions {
             shelf_positions.insert(key, pos);
         }

         Self {
             shelf_positions, // Assign the rebuilt tracker
             is_customized: serializable.is_customized,
         }
     }

    const BOUND: Bound = Bound::Unbounded;
}

// Default step size for shelf item positioning
pub const SHELF_ITEM_STEP_SIZE: f64 = 1000.0;

impl Shelf {
    /// Creates a new shelf with provided properties
    pub fn new(shelf_id: ShelfId, title: String, owner: Principal) -> Self {
        let now = ic_cdk::api::time();
        Self {
            shelf_id,
            title,
            description: None,
            owner,
            editors: Vec::new(),
            items: BTreeMap::new(),
            // Initialize PositionTracker
            item_positions: PositionTracker::new(), 
            created_at: now,
            updated_at: now,
            appears_in: Vec::new(),
            tags: Vec::new(), 
            is_public: false, 
        }
    }

    /// Builder-style method to add a description
    pub fn with_description(mut self, description: Option<String>) -> Self {
        self.description = description;
        self
    }

    /// Builder-style method to add editors
    pub fn with_editors(mut self, editors: Vec<Principal>) -> Self {
        self.editors = editors;
        self
    }

    /// Builder-style method to add tags (expects normalized tags)
    pub fn with_tags(mut self, normalized_tags: Vec<NormalizedTag>) -> Self {
        // Assumes tags are already normalized and validated by caller
        self.tags = normalized_tags.into_iter().take(MAX_TAGS_PER_SHELF).collect();
        self
    }

    pub fn insert_item(&mut self, item: Item) -> Result<(), String> {
        if self.item_positions.len() >= MAX_ITEMS_PER_SHELF {
            // Check length using tracker now
            return Err(format!("Maximum item limit reached ({})", MAX_ITEMS_PER_SHELF));
        }

        // --- Validate Item Content ---
        match &item.content {
            ItemContent::Nft(nft_id) => {
                if nft_id.chars().any(|c| !c.is_digit(10)) {
                     return Err("Invalid NFT ID: Contains non-digit characters.".to_string());
                }
                if nft_id.len() > MAX_NFT_ID_LENGTH {
                    return Err(format!("NFT ID exceeds maximum length of {} characters", MAX_NFT_ID_LENGTH));
                }
                // NOTE: NFT existence/ownership check happens in the update::item::add_item_to_shelf function
            }
            ItemContent::Markdown(markdown) => {
                if markdown.len() > MAX_MARKDOWN_LENGTH {
                     return Err(format!("Markdown content exceeds maximum length of {} characters", MAX_MARKDOWN_LENGTH));
                }
                 // TODO: Add more specific Markdown validation if needed (e.g., disallowed tags, structure)
            }
            ItemContent::Shelf(nested_shelf_id) => {
                if nested_shelf_id == &self.shelf_id {
                    return Err("Circular reference: A shelf cannot contain itself".to_string());
                }
                let nested_contains_self = SHELVES.with(|shelves_map| {
                    shelves_map.borrow().get(nested_shelf_id).map_or(false, |nested_shelf| {
                        // Check items map of nested shelf
                        nested_shelf.items.values().any(|nested_item| {
                            matches!(&nested_item.content, ItemContent::Shelf(id_in_nested) if id_in_nested == &self.shelf_id)
                        })
                    })
                });
                if nested_contains_self {
                    return Err(format!(
                        "Circular reference detected: Shelf '{}' already contains shelf '{}'",
                        nested_shelf_id, self.shelf_id
                    ));
                }
            }
        }

        // --- Proceed with Insertion ---
        let item_id = item.id;

        // Calculate position at the end using PositionTracker
        // Pass SHELF_ITEM_STEP_SIZE as default step
        let new_position = self.item_positions.calculate_position(
            None, // No reference key means add to end (implicitly)
            false, // 'after' flag when no reference means end
            SHELF_ITEM_STEP_SIZE
        )?;

        // Insert into PositionTracker
        self.item_positions.insert(item_id, new_position);

        // Store the item itself
        self.items.insert(item_id, item);

        Ok(())
    }

    pub fn move_item(&mut self, item_id: u32, reference_item_id: Option<u32>, before: bool) -> Result<(), String> {
        // Verify the item exists using the tracker's contains_key method
        if !self.item_positions.contains_key(&item_id) {
             // Check items map as well for consistency
             if self.items.contains_key(&item_id) {
                  ic_cdk::println!("ERROR: Item {} found in items map but not in position tracker for shelf {}", item_id, self.shelf_id);
                  return Err("Internal state inconsistency: Item position missing".to_string());
             }
             return Err("Item not found".to_string());
        }
        // Verify reference item exists in the tracker if provided
        if let Some(ref_id) = reference_item_id {
             if !self.item_positions.contains_key(&ref_id) {
                 return Err("Reference item not found".to_string());
             }
        }

        // Calculate new position using PositionTracker
        let new_position = self.item_positions.calculate_position(
            reference_item_id.as_ref(), // Pass Option<&u32> directly
            before, 
            SHELF_ITEM_STEP_SIZE
        )?;

        // Update the position in the tracker (insert handles update)
        self.item_positions.insert(item_id, new_position);
        
        Ok(())
    }

    /// Gets items in the order defined by item_positions
    pub fn get_ordered_items(&self) -> Vec<Item> {
        self.item_positions
            .iter_keys_ordered() // Get keys (item IDs) in position order O(N)
            .filter_map(|item_id| self.items.get(item_id).cloned()) // Fetch and clone items O(N * log N)
            .collect() // O(N)
    }
    
    /// Rebalances all item positions using PositionTracker
    pub fn rebalance_positions(&mut self) {
        self.item_positions.rebalance_positions(SHELF_ITEM_STEP_SIZE);
    }
}

// Tag validation function (can be moved or kept here temporarily)
// Should ideally be called from the update logic
pub fn validate_tag_format(tag: &NormalizedTag) -> Result<(), String> {
    // Check length 
    if tag.len() > MAX_TAG_LENGTH {
        return Err(format!("Tag exceeds maximum length of {}", MAX_TAG_LENGTH));
    }
    
    // Check for non-alphanumeric characters (stricter)
    if !tag.chars().all(|c| c.is_alphanumeric()) {
        return Err("Tags can only contain letters (a-z, A-Z) and numbers (0-9)".to_string());
    }
    
    // Ensure tag is not empty (already covered by alphanumeric check, but good practice)
    if tag.is_empty() {
         return Err("Tag cannot be empty".to_string());
    }
    
    Ok(())
}

// Modified create_shelf to handle tags differently
pub async fn create_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>, // Accepts raw tags
) -> Result<Shelf, String> {
    // Input validation
    if title.trim().is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    if title.len() > 100 {
        return Err("Title is too long (max 100 characters)".to_string());
    }
    if let Some(ref desc) = description {
        if desc.len() > 500 {
            return Err("Description is too long (max 500 characters)".to_string());
        }
    }
    
    // Normalize, validate, and deduplicate tags
    let mut normalized_tags = Vec::new();
    if let Some(tag_list) = tags {
        if tag_list.len() > MAX_TAGS_PER_SHELF {
            return Err(format!("Too many tags provided (max {})", MAX_TAGS_PER_SHELF));
        }
        
        let mut unique_normalized = BTreeSet::new();
        for tag in tag_list {
            let normalized = normalize_tag(&tag);
            validate_tag_format(&normalized)?; // Validate format here
            unique_normalized.insert(normalized);
        }
        normalized_tags = unique_normalized.into_iter().collect();
    }
    
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();
    
    // Create shelf ID
    let shelf_id = {
        let mut hasher = sha2::Sha256::new();
        let id_input = format!("{}:{}:{}", caller.to_text(), now, title);
        use sha2::Digest;
        hasher.update(id_input.as_bytes());
        let hash = hasher.finalize();
        bs58::encode(hash).into_string()
    };
    
    // Create the new shelf, passing normalized tags
    let mut shelf = Shelf::new(shelf_id.clone(), title, caller)
        .with_description(description)
        .with_tags(normalized_tags); // Pass normalized tags
    
    // Add the items
    for item in items {
        shelf.insert_item(item)?;
    }
    
    // Tag association logic will happen in the calling function (store_shelf)
    // using the dedicated add_tag_to_shelf update method
    
    Ok(shelf)
}

// --- Wrapper Structs for Storable Collections for Follows ---

#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct PrincipalSet(pub BTreeSet<Principal>);

impl Storable for PrincipalSet {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let set = Decode!(bytes.as_ref(), BTreeSet<Principal>).unwrap();
        Self(set)
    }
    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct NormalizedTagSet(pub BTreeSet<NormalizedTag>);

impl Storable for NormalizedTagSet {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let set = Decode!(bytes.as_ref(), BTreeSet<NormalizedTag>).unwrap();
        Self(set)
    }
    const BOUND: Bound = Bound::Unbounded;
}