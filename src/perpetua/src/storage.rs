use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;
use crate::ordering::{PositionedOrdering, get_ordered_by_position};
use sha2;
use bs58;

/// Normalizes a tag by converting to lowercase, trimming whitespace
/// This helps prevent duplicates with minor variations
pub fn normalize_tag(tag: &str) -> String {
    tag.trim().to_lowercase()
}

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage maps
const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);
const GLOBAL_TIMELINE_MEM_ID: MemoryId = MemoryId::new(3);
const TAG_SHELVES_MEM_ID: MemoryId = MemoryId::new(4);
const TAG_POPULARITY_MEM_ID: MemoryId = MemoryId::new(5);
const TAG_LAST_USED_MEM_ID: MemoryId = MemoryId::new(6);
const TAG_PREFIX_MEM_ID: MemoryId = MemoryId::new(7);
const USER_PROFILE_ORDER_MEM_ID: MemoryId = MemoryId::new(8);
const USER_TAG_COUNTS_MEM_ID: MemoryId = MemoryId::new(9);

// Constants for tag cleanup and indexing
pub const TAG_CLEANUP_THRESHOLD: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
pub const MIN_TAG_USAGE_COUNT: usize = 3; // Minimum number of uses to keep a tag
pub const PREFIX_LENGTH: usize = 2; // Length of prefix for tag indexing

// Remove the MAX_VALUE_SIZE constant since we're using unbounded storage
const MAX_TAG_LENGTH: usize = 10;
pub const MAX_TAGS_PER_SHELF: usize = 3;

// Constants for rate limiting
pub const MAX_TAGS_PER_USER: usize = 100;
pub const TAG_RATE_LIMIT_WINDOW: u64 = 24 * 60 * 60 * 1_000_000_000; // 24 hours in ns

// Constants for shelf operations
pub const MAX_ITEMS_PER_SHELF: usize = 500;
pub const MAX_APPEARS_IN_COUNT: usize = 100;

// New wrapper types
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct StringVec(pub Vec<String>);

#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TimestampedShelves(pub BTreeSet<(u64, String)>);

// Add back the ItemContent and Item types
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ItemContent {
    Nft(String), // NFT ID
    Markdown(String), // Markdown text
    Shelf(String), // Shelf ID - allows nesting shelves
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
    pub static SHELVES: RefCell<StableBTreeMap<String, Shelf, Memory>> = RefCell::new(
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
    pub static GLOBAL_TIMELINE: RefCell<StableBTreeMap<u64, String, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GLOBAL_TIMELINE_MEM_ID))
        )
    );
    
    // Tag shelves index: K: tag, V: StringVec (shelf_ids)
    pub static TAG_SHELVES: RefCell<StableBTreeMap<String, StringVec, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_SHELVES_MEM_ID))
        )
    );
    
    // Tag popularity index: K: count (reversed for sorting), V: tag
    pub static TAG_POPULARITY: RefCell<StableBTreeMap<u64, String, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_POPULARITY_MEM_ID))
        )
    );
    
    // Tag last used timestamp: K: tag, V: timestamp
    pub static TAG_LAST_USED: RefCell<StableBTreeMap<String, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_LAST_USED_MEM_ID))
        )
    );
    
    // Tag prefix index: K: prefix, V: StringVec (tags)
    pub static TAG_PREFIXES: RefCell<StableBTreeMap<String, StringVec, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TAG_PREFIX_MEM_ID))
        )
    );
    
    // Flag to track if popularity index needs update
    pub static POPULARITY_NEEDS_UPDATE: RefCell<bool> = RefCell::new(false);
    
    // User profile shelf order: K: Principal, V: UserProfileOrder
    pub static USER_PROFILE_ORDER: RefCell<StableBTreeMap<Principal, UserProfileOrder, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_PROFILE_ORDER_MEM_ID))
        )
    );
    
    // User tag rate limiting: K: Principal, V: UserTagCount
    pub static USER_TAG_COUNTS: RefCell<StableBTreeMap<Principal, UserTagCount, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_TAG_COUNTS_MEM_ID))
        )
    );
}

// Updated Shelf structure - remove Default trait
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shelf {
    pub shelf_id: String,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub editors: Vec<Principal>,      // List of principals with edit access
    pub items: BTreeMap<u32, Item>,      // Items stored by ID
    pub item_positions: BTreeMap<u32, f64>, // Map: item_id -> position number
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<String>,         // List of shelf IDs that appear in this shelf
    pub tags: Vec<String>,               // List of tags, limited to 3 per shelf
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

impl Storable for UserTagCount {
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
    pub fn new(shelf_id: String, title: String, owner: Principal) -> Self {
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
            tags: Vec::new(),
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

    /// Builder-style method to add tags
    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        // Only store up to MAX_TAGS_PER_SHELF
        self.tags = tags.into_iter().take(MAX_TAGS_PER_SHELF).collect();
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

// Tag validation function
pub fn validate_tag(tag: &str) -> Result<(), String> {
    let normalized = normalize_tag(tag);
    
    // Check length after normalization
    if normalized.len() > MAX_TAG_LENGTH {
        return Err(format!("Tag exceeds maximum length of {}", MAX_TAG_LENGTH));
    }
    
    // Check for whitespace of any kind
    if normalized.chars().any(|c| c.is_whitespace()) {
        return Err("Tags cannot contain whitespace".to_string());
    }
    
    // Check for control characters
    if normalized.chars().any(|c| c.is_control()) {
        return Err("Tags cannot contain control characters".to_string());
    }
    
    // Ensure tag has at least one visible character
    if normalized.is_empty() || normalized.chars().all(|c| !c.is_alphanumeric()) {
        return Err("Tags must contain at least one alphanumeric character".to_string());
    }
    
    Ok(())
}

// Function to update tag tracking when adding a tag - fix entry API usage
pub fn add_tag_to_tracking(tag: &str, shelf_id: &str) -> Result<(), String> {
    let normalized_tag = normalize_tag(tag);
    let now = ic_cdk::api::time();
    
    TAG_SHELVES.with(|tag_shelves| {
        let mut tag_map = tag_shelves.borrow_mut();
        let mut shelves = tag_map.get(&normalized_tag).unwrap_or_default();
        
        // Only add if not already present
        if !shelves.0.contains(&shelf_id.to_string()) {
            shelves.0.push(shelf_id.to_string());
            tag_map.insert(normalized_tag.clone(), shelves);
        }
    });
    
    // Update last used timestamp
    TAG_LAST_USED.with(|last_used| {
        last_used.borrow_mut().insert(normalized_tag.clone(), now);
    });
    
    // Get current count for popularity tracking
    let current_count = TAG_SHELVES.with(|tag_shelves| {
        tag_shelves.borrow()
            .get(&normalized_tag)
            .map_or(1, |shelves| shelves.0.len())
    });
    
    // Update popularity tracking
    update_tag_popularity(&normalized_tag, current_count);
    
    // Update prefix index if tag is long enough
    if normalized_tag.len() >= PREFIX_LENGTH {
        let prefix = normalized_tag.chars().take(PREFIX_LENGTH).collect::<String>();
        
        TAG_PREFIXES.with(|prefixes| {
            let mut prefix_map = prefixes.borrow_mut();
            let mut tags = prefix_map.get(&prefix).unwrap_or_default();
            
            // Only add if not already present
            if !tags.0.contains(&normalized_tag) {
                tags.0.push(normalized_tag.clone());
                prefix_map.insert(prefix, tags);
            }
        });
    }
    
    Ok(())
}

// Function to update tag tracking when removing a tag
pub fn remove_tag_from_tracking(tag: &str, shelf_id: &str) -> Result<(), String> {
    let normalized_tag = normalize_tag(tag);
    
    TAG_SHELVES.with(|tag_shelves| {
        let mut tag_map = tag_shelves.borrow_mut();
        if let Some(shelves) = tag_map.get(&normalized_tag) {
            let mut shelves_clone = shelves.clone();
            shelves_clone.0.retain(|id| id != shelf_id);
            
            // Update or remove the entry
            if shelves_clone.0.is_empty() {
                tag_map.remove(&normalized_tag);
                
                // Remove from prefix index if tag is long enough
                if normalized_tag.len() >= PREFIX_LENGTH {
                    let prefix = normalized_tag.chars().take(PREFIX_LENGTH).collect::<String>();
                    
                    TAG_PREFIXES.with(|prefixes| {
                        let mut prefix_map = prefixes.borrow_mut();
                        if let Some(tags) = prefix_map.get(&prefix) {
                            let mut tags_clone = tags.clone();
                            tags_clone.0.retain(|t| t != &normalized_tag);
                            
                            if tags_clone.0.is_empty() {
                                prefix_map.remove(&prefix);
                            } else {
                                prefix_map.insert(prefix, tags_clone);
                            }
                        }
                    });
                }
                
                // Remove from last used tracking
                TAG_LAST_USED.with(|last_used| {
                    last_used.borrow_mut().remove(&normalized_tag);
                });
                
                // Remove from popularity tracking
                TAG_POPULARITY.with(|popularity| {
                    let mut pop_map = popularity.borrow_mut();
                    let mut count_to_remove = None;
                    
                    for (count, t) in pop_map.iter() {
                        if t.as_str() == normalized_tag {
                            count_to_remove = Some(count.clone());
                            break;
                        }
                    }
                    
                    if let Some(count) = count_to_remove {
                        pop_map.remove(&count);
                    }
                });
            } else {
                tag_map.insert(normalized_tag.clone(), shelves_clone.clone());
                
                // Update popularity tracking
                update_tag_popularity(&normalized_tag, shelves_clone.0.len());
            }
        }
    });
    
    // Mark that popularity index needs update
    POPULARITY_NEEDS_UPDATE.with(|needs_update| {
        *needs_update.borrow_mut() = true;
    });
    
    Ok(())
}

// Update tag popularity index
pub fn update_tag_popularity(tag: &str, count: usize) {
    // Just mark that an update is needed instead of updating immediately
    POPULARITY_NEEDS_UPDATE.with(|needs_update| {
        *needs_update.borrow_mut() = true;
    });
    
    // Only update immediately if it's a critical change (tag with zero count)
    if count == 0 {
        TAG_POPULARITY.with(|popularity| {
            let mut pop_map = popularity.borrow_mut();
            let mut count_to_remove = None;
            
            // Remove any existing entry
            for (old_count, t) in pop_map.iter() {
                if t.as_str() == tag {
                    count_to_remove = Some(old_count.clone());
                    break;
                }
            }
            
            if let Some(old_count) = count_to_remove {
                pop_map.remove(&old_count);
            }
        });
    }
}

// Batch update for tag popularity - called periodically
pub fn update_tag_popularity_index() -> usize {
    // Check if update is needed
    let needs_update = POPULARITY_NEEDS_UPDATE.with(|flag| {
        let current = *flag.borrow();
        *flag.borrow_mut() = false;
        current
    });
    
    if !needs_update {
        return 0;
    }
    
    // Recreate the entire popularity index
    let mut updated_count = 0;
    
    TAG_POPULARITY.with(|popularity| {
        let mut pop_map = popularity.borrow_mut();
        
        // Collect entries to remove
        let keys: Vec<u64> = pop_map.iter()
            .map(|(k, _)| k.clone())
            .collect();
        
        // Remove existing entries one by one
        for key in keys {
            pop_map.remove(&key);
        }
        
        // Create new entries based on current tag usage
        TAG_SHELVES.with(|tag_shelves| {
            let shelves_map = tag_shelves.borrow();
            
            for (tag, shelves) in shelves_map.iter() {
                let count = shelves.0.len();
                if count > 0 {
                    // Use reversed count for sorting
                    let reversed_count = u64::MAX - count as u64;
                    pop_map.insert(reversed_count, tag.clone());
                    updated_count += 1;
                }
            }
        });
    });
    
    updated_count
}

// Modified create_shelf to use caller principal and handle tags
pub async fn create_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>,  // New parameter
) -> Result<Shelf, String> {
    // Input validation
    if title.trim().is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    
    // Check for title length
    if title.len() > 100 {
        return Err("Title is too long (max 100 characters)".to_string());
    }
    
    // Check for description length if provided
    if let Some(ref desc) = description {
        if desc.len() > 500 {
            return Err("Description is too long (max 500 characters)".to_string());
        }
    }
    
    // Validate tags if provided
    let validated_tags = if let Some(tag_list) = tags {
        // Limit the number of tags
        if tag_list.len() > MAX_TAGS_PER_SHELF {
            return Err(format!("Too many tags (max {})", MAX_TAGS_PER_SHELF));
        }
        
        // Validate each tag
        let mut normalized_tags = Vec::new();
        for tag in tag_list {
            validate_tag(&tag)?;
            normalized_tags.push(normalize_tag(&tag));
        }
        
        // Remove duplicates by converting to a set and back
        let mut unique_tags = BTreeSet::new();
        for tag in normalized_tags {
            unique_tags.insert(tag);
        }
        
        unique_tags.into_iter().collect()
    } else {
        Vec::new()
    };
    
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();
    
    // Create a unique ID for the shelf (hash of owner + timestamp + title)
    let shelf_id = {
        let mut hasher = sha2::Sha256::new();
        let id_input = format!("{}:{}:{}", caller.to_text(), now, title);
        use sha2::Digest;
        hasher.update(id_input.as_bytes());
        let hash = hasher.finalize();
        // Use base58 for a more URL-friendly ID
        bs58::encode(hash).into_string()
    };
    
    // Create the new shelf using builder pattern
    let mut shelf = Shelf::new(shelf_id.clone(), title, caller)
        .with_description(description)
        .with_tags(validated_tags);
    
    // Add the items if any were provided
    for item in items {
        shelf.insert_item(item)?;
    }
    
    // We'll add the shelf to data structures in the caller function, not here
    // This avoids duplicating this logic between here and store_shelf
    
    Ok(shelf)
}

// Structure for tracking custom shelf order in user profiles
#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct UserProfileOrder {
    // Only stores position values for explicitly positioned shelves
    pub shelf_positions: BTreeMap<String, f64>,
    // Flag indicating if this profile has customized ordering
    pub is_customized: bool,
}

// Structure to hold user tag counts for rate limiting
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserTagCount {
    pub last_reset_time: u64,
    pub count: usize,
}

// Check if a user has hit their tag rate limit
pub fn check_tag_rate_limit(user: &Principal) -> Result<(), String> {
    let now = ic_cdk::api::time();
    
    USER_TAG_COUNTS.with(|counts| {
        let mut counts_map = counts.borrow_mut();
        
        // Get or initialize the user's count
        let user_tag_count = counts_map
            .get(user)
            .map(|count| count.clone())
            .unwrap_or(UserTagCount { 
                last_reset_time: now, 
                count: 0 
            });
        
        // Check if we should reset the window
        let new_tag_count = if now - user_tag_count.last_reset_time > TAG_RATE_LIMIT_WINDOW {
            // Reset window and count
            UserTagCount { 
                last_reset_time: now, 
                count: 1 
            }
        } else if user_tag_count.count >= MAX_TAGS_PER_USER {
            return Err(format!(
                "Rate limit exceeded. Maximum {} tags per {} hours", 
                MAX_TAGS_PER_USER, 
                TAG_RATE_LIMIT_WINDOW / (60 * 60 * 1_000_000_000)
            ));
        } else {
            // Increment within current window
            UserTagCount { 
                last_reset_time: user_tag_count.last_reset_time, 
                count: user_tag_count.count + 1 
            }
        };
        
        // Update the counter
        counts_map.insert(*user, new_tag_count);
        
        Ok(())
    })
}

// Function to clean up rarely used tags
pub fn cleanup_unused_tags() -> usize {
    let now = ic_cdk::api::time();
    let mut tags_to_remove = Vec::new();
    
    // Identify tags to remove (old + rarely used)
    TAG_LAST_USED.with(|last_used| {
        let last_used_map = last_used.borrow();
        
        for (tag, last_time) in last_used_map.iter() {
            // Skip if the tag was used recently
            if now - last_time < TAG_CLEANUP_THRESHOLD {
                continue;
            }
            
            // Check if the tag has few uses
            let usage_count = TAG_SHELVES.with(|tag_shelves| {
                tag_shelves.borrow()
                    .get(&tag)
                    .map(|shelves| shelves.0.len())
                    .unwrap_or(0)
            });
            
            if usage_count < MIN_TAG_USAGE_COUNT {
                tags_to_remove.push(tag.clone());
            }
        }
    });
    
    // Process the tags to remove
    for tag in &tags_to_remove {
        // Remove from TAG_SHELVES
        TAG_SHELVES.with(|tag_shelves| {
            tag_shelves.borrow_mut().remove(tag);
        });
        
        // Remove from TAG_POPULARITY
        TAG_POPULARITY.with(|popularity| {
            let mut pop_map = popularity.borrow_mut();
            let mut count_to_remove = None;
            
            for (count, t) in pop_map.iter() {
                if t.as_str() == tag.as_str() {
                    count_to_remove = Some(count.clone());
                    break;
                }
            }
            
            if let Some(count) = count_to_remove {
                pop_map.remove(&count);
            }
        });
        
        // Remove from TAG_LAST_USED
        TAG_LAST_USED.with(|last_used| {
            last_used.borrow_mut().remove(tag);
        });
        
        // Remove from TAG_PREFIXES if tag is long enough
        if tag.len() >= PREFIX_LENGTH {
            let prefix = tag.chars().take(PREFIX_LENGTH).collect::<String>();
            
            TAG_PREFIXES.with(|prefixes| {
                let mut prefix_map = prefixes.borrow_mut();
                if let Some(tags) = prefix_map.get(&prefix) {
                    let mut tags_clone = tags.clone();
                    tags_clone.0.retain(|t| t != tag);
                    
                    if tags_clone.0.is_empty() {
                        prefix_map.remove(&prefix);
                    } else {
                        prefix_map.insert(prefix, tags_clone);
                    }
                }
            });
        }
    }
    
    tags_to_remove.len()
}