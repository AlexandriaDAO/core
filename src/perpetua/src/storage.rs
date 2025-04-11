use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;
use crate::ordering::{PositionedOrdering, get_ordered_by_position};
use crate::utils::normalize_tag; // Import the normalization function
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
pub struct TagShelfAssociationKey(pub NormalizedTag, pub ShelfId);

impl Storable for TagShelfAssociationKey {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0, &self.1).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let (tag, shelf_id) = Decode!(bytes.as_ref(), NormalizedTag, ShelfId).unwrap();
        Self(tag, shelf_id)
    }
    const BOUND: Bound = Bound::Unbounded;
}
// Manual Ord implementation needed because tuple derives Ord lexicographically
impl PartialOrd for TagShelfAssociationKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
impl Ord for TagShelfAssociationKey {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.0.cmp(&other.0) {
            Ordering::Equal => self.1.cmp(&other.1),
            other => other,
        }
    }
}


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
pub struct TagPopularityKey(pub u64, pub NormalizedTag);

impl Storable for TagPopularityKey {
     fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.0, &self.1).unwrap()) }
     fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let (count, tag) = Decode!(bytes.as_ref(), u64, NormalizedTag).unwrap();
        Self(count, tag)
    }
    const BOUND: Bound = Bound::Unbounded;
}
impl PartialOrd for TagPopularityKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}
impl Ord for TagPopularityKey {
     fn cmp(&self, other: &Self) -> Ordering {
         // Note: Higher count should come first in reverse iteration
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


// Constants for shelf operations
pub const MAX_ITEMS_PER_SHELF: usize = 500;
pub const MAX_APPEARS_IN_COUNT: usize = 100; // Keep this if relevant elsewhere
// --- Define new constants ---
pub const MAX_TAG_LENGTH: usize = 50; // Adjusted max tag length
pub const MAX_TAGS_PER_SHELF: usize = 10; // Adjusted max tags per shelf

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
}

// Updated Shelf structure - use NormalizedTag
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shelf {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub editors: Vec<Principal>,      // List of principals with edit access
    pub items: BTreeMap<u32, Item>,      // Items stored by ID
    pub item_positions: BTreeMap<u32, f64>, // Map: item_id -> position number
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,         // List of shelf IDs that appear in this shelf
    pub tags: Vec<NormalizedTag>,         // Use NormalizedTag
    pub is_public: bool,                  // Flag to indicate if shelf is publicly editable
}

// Updated Storable implementation using Unbounded size
impl Storable for Shelf {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
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

impl Storable for UserProfileOrder {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Default step size for shelf item positioning
const SHELF_ITEM_STEP_SIZE: f64 = 1000.0;

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
            item_positions: BTreeMap::new(),
            created_at: now,
            updated_at: now,
            appears_in: Vec::new(),
            tags: Vec::new(), // Initialize with empty Vec<NormalizedTag>
            is_public: false, // Default to private
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
        if self.items.len() >= MAX_ITEMS_PER_SHELF {
            return Err(format!("Maximum item limit reached ({})", MAX_ITEMS_PER_SHELF));
        }
        
        // Check for circular references
        if let ItemContent::Shelf(ref nested_shelf_id) = item.content {
            // Prevent a shelf from containing itself
            if nested_shelf_id == &self.shelf_id {
                return Err("Circular reference: A shelf cannot contain itself".to_string());
            }
            
            // Check for deeper circular references by traversing the shelf hierarchy
            if self.has_circular_reference(nested_shelf_id) {
                return Err("Circular reference detected in shelf hierarchy".to_string());
            }
        }
        
        let item_id = item.id;
        
        // Calculate position at the end using the shared abstraction (now mutable)
        // Pass SHELF_ITEM_STEP_SIZE as default step
        let new_position = self.item_positions.calculate_position(None, false, SHELF_ITEM_STEP_SIZE)?; 
            
        // Update the float position
        self.item_positions.insert(item_id, new_position);
        
        // Store the item without a position field
        self.items.insert(item_id, item);
        
        Ok(())
    }

    // Helper method to check for circular references in the shelf hierarchy
    fn has_circular_reference(&self, shelf_id: &str) -> bool {
        // Track visited shelves to avoid redundant lookups
        let mut visited = BTreeSet::new();
        visited.insert(self.shelf_id.clone());
        
        // Use a stack-based approach rather than recursion
        let mut stack = Vec::new();
        
        // Initialize stack with all immediate children (shelf items)
        for item in self.items.values() {
            if let ItemContent::Shelf(nested_id) = &item.content {
                if nested_id == shelf_id {
                    return true; // Direct circular reference
                }
                stack.push(nested_id.clone());
            }
        }
        
        // Stack-based traversal of the hierarchy
        while let Some(current_id) = stack.pop() {
            // Skip if already visited
            if !visited.insert(current_id.clone()) {
                continue;
            }
            
            // If current shelf is the one we're checking, we found a circular reference
            if current_id == shelf_id {
                return true;
            }
            
            // Check all children of the current shelf
            let found_circular = SHELVES.with(|shelves| {
                let shelves_map = shelves.borrow();
                if let Some(nested_shelf) = shelves_map.get(&current_id) {
                    // Add all shelf items to stack for processing
                    for item in nested_shelf.items.values() {
                        if let ItemContent::Shelf(next_id) = &item.content {
                            if next_id == shelf_id {
                                return true; // Found circular reference
                            }
                            stack.push(next_id.clone());
                        }
                    }
                }
                false
            });
            
            if found_circular {
                return true;
            }
        }
        
        false
    }

    pub fn move_item(&mut self, item_id: u32, reference_item_id: Option<u32>, before: bool) -> Result<(), String> {
        // First verify the item exists
        if !self.items.contains_key(&item_id) {
            return Err("Item not found".to_string());
        }

        // Calculate new position using the shared abstraction (now mutable)
        // Pass SHELF_ITEM_STEP_SIZE as default step
        let new_position = self.item_positions.calculate_position(
            reference_item_id.as_ref(), 
            before, 
            SHELF_ITEM_STEP_SIZE
        )?;

        // Update the float position
        self.item_positions.insert(item_id, new_position);
        
        Ok(())
    }

    pub fn get_ordered_items(&self) -> Vec<Item> {
        // Use the shared helper function for ordering
        get_ordered_by_position(&self.items, &self.item_positions)
    }
    
    // Rebalances all item positions to be evenly distributed
    pub fn rebalance_positions(&mut self) {
        if self.items.is_empty() {
            return;
        }
        
        // Use the shared implementation for rebalancing
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
    
    // Check for whitespace (shouldn't happen after normalization, but good check)
    if tag.chars().any(|c| c.is_whitespace()) {
        return Err("Tags cannot contain whitespace".to_string());
    }
    
    // Check for control characters
    if tag.chars().any(|c| c.is_control()) {
        return Err("Tags cannot contain control characters".to_string());
    }
    
    // Ensure tag has at least one visible character
    if tag.is_empty() || tag.chars().all(|c| !c.is_alphanumeric()) {
        return Err("Tags must contain at least one alphanumeric character".to_string());
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

// Structure for tracking custom shelf order in user profiles (Keep as is)
#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct UserProfileOrder {
    pub shelf_positions: BTreeMap<ShelfId, f64>,
    pub is_customized: bool,
}