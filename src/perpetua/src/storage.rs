use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;
use crate::utils;
use crate::ordering::{PositionedOrdering, get_ordered_by_position, ensure_balanced_positions};

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

// Constants for tag cleanup and indexing
pub const TAG_CLEANUP_THRESHOLD: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
pub const MIN_TAG_USAGE_COUNT: usize = 3; // Minimum number of uses to keep a tag
pub const PREFIX_LENGTH: usize = 2; // Length of prefix for tag indexing

const MAX_VALUE_SIZE: u32 = 8192; // 8kb should be good for a decent sized markdown file.
const MAX_TAG_LENGTH: usize = 10;
pub const MAX_TAGS_PER_SHELF: usize = 3;

// Constants for rate limiting
pub const MAX_TAGS_PER_USER: usize = 100;
pub const TAG_RATE_LIMIT_WINDOW: u64 = 24 * 60 * 60 * 1_000_000_000; // 24 hours in ns

// New wrapper types
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct StringVec(pub Vec<String>);

#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TimestampedShelves(pub BTreeSet<(u64, String)>);

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
    pub static USER_PROFILE_ORDER: RefCell<BTreeMap<Principal, UserProfileOrder>> = RefCell::new(BTreeMap::new());
    
    // User tag rate limiting: K: Principal, V: (last_reset_time, count)
    pub static USER_TAG_COUNTS: RefCell<BTreeMap<Principal, (u64, usize)>> = RefCell::new(BTreeMap::new());
}

// Updated Shelf structure
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
    pub needs_rebalance: bool,           // Flag indicating if positions should be rebalanced
    pub rebalance_count: u32,            // Tracks number of rebalancing operations
    pub appears_in: Vec<String>,         // List of shelf IDs that appear in this shelf
    pub tags: Vec<String>,               // List of tags, limited to 3 per shelf
}

// Updated Storable implementation using MAX_VALUE_SIZE
impl Storable for Shelf {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for Item {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1024, // Adjust based on expected content size
        is_fixed_size: false,
    };
}

impl Storable for StringVec {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for TimestampedShelves {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

// Thresholds for shelf item positioning rebalancing
const SHELF_ITEM_THRESHOLDS: [(usize, f64); 3] = [
    (400, 1e-10),
    (200, 1e-8),
    (0, 1e-6)
];

// Default step size for shelf item positioning
const SHELF_ITEM_STEP_SIZE: f64 = 1000.0;

impl Shelf {
    pub fn insert_item(&mut self, item: Item) -> Result<(), String> {
        if self.items.len() >= 500 {
            return Err("Maximum item limit reached (500)".to_string());
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
        
        // Initialize position at the end using the shared abstraction
        let new_position = self.item_positions.calculate_position(None, false, 1.0).unwrap();
            
        // Update the float position
        self.item_positions.insert(item_id, new_position);
        
        // Store the item without a position field
        self.items.insert(item_id, item);
        
        // Check if we need rebalancing (when there are many items)
        self.check_position_spacing();
        
        Ok(())
    }

    // Helper method to check for circular references in the shelf hierarchy
    fn has_circular_reference(&self, shelf_id: &str) -> bool {
        // Check if any item in the current shelf contains the target shelf
        for item in self.items.values() {
            if let ItemContent::Shelf(nested_id) = &item.content {
                // If this item contains the shelf we're checking, we have a circular reference
                if nested_id == shelf_id {
                    return true;
                }
                
                // Check deeper in the hierarchy
                // We need to get the nested shelf from the global storage
                let has_deeper_circular_ref = SHELVES.with(|shelves| {
                    let shelves_map = shelves.borrow();
                    if let Some(nested_shelf) = shelves_map.get(nested_id) {
                        nested_shelf.has_circular_reference(shelf_id)
                    } else {
                        false
                    }
                });
                
                if has_deeper_circular_ref {
                    return true;
                }
            }
        }
        
        false
    }

    pub fn move_item(&mut self, item_id: u32, reference_item_id: Option<u32>, before: bool) -> Result<(), String> {
        // First verify the item exists
        if !self.items.contains_key(&item_id) {
            return Err("Item not found".to_string());
        }

        // Calculate new position using the shared abstraction
        let new_position = self.item_positions.calculate_position(
            reference_item_id.as_ref(), 
            before, 
            1.0
        )?;

        // Update the float position
        self.item_positions.insert(item_id, new_position);
        
        // Check if positions have become too close, requiring rebalancing
        self.check_position_spacing();

        Ok(())
    }

    pub fn get_ordered_items(&self) -> Vec<Item> {
        // Use the shared helper function for ordering
        get_ordered_by_position(&self.items, &self.item_positions)
    }
    
    // Checks if positions have become too close, potentially requiring rebalancing
    fn check_position_spacing(&mut self) {
        // Use the shared implementation to check if rebalancing is needed
        if self.item_positions.needs_rebalancing(&SHELF_ITEM_THRESHOLDS) {
            self.needs_rebalance = true;
        }
    }
    
    // Rebalances all item positions to be evenly distributed
    pub fn rebalance_positions(&mut self) {
        if self.items.is_empty() {
            return;
        }
        
        // Use the shared implementation for rebalancing
        self.item_positions.rebalance_positions(SHELF_ITEM_STEP_SIZE);
        
        self.needs_rebalance = false;
        self.rebalance_count += 1;
    }
    
    // Ensures positions are balanced before any operation that depends on the ordering
    pub fn ensure_balanced_positions(&mut self) {
        if self.needs_rebalance {
            self.rebalance_positions();
        }
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

// Function to update tag tracking when adding a tag
pub fn add_tag_to_tracking(tag: &str, shelf_id: &str) -> Result<(), String> {
    let normalized_tag = normalize_tag(tag);
    let now = ic_cdk::api::time();
    
    TAG_SHELVES.with(|tag_shelves| {
        let mut tag_map = tag_shelves.borrow_mut();
        let mut shelves = tag_map.get(&normalized_tag).unwrap_or_default();
        
        // Only add if not already present
        if !shelves.0.contains(&shelf_id.to_string()) {
            shelves.0.push(shelf_id.to_string());
            tag_map.insert(normalized_tag.clone(), shelves.clone());
            
            // Update last used timestamp
            TAG_LAST_USED.with(|last_used| {
                last_used.borrow_mut().insert(normalized_tag.clone(), now);
            });
            
            // Update popularity tracking
            update_tag_popularity(&normalized_tag, shelves.0.len());
            
            // Update prefix index if tag is long enough
            if normalized_tag.len() >= PREFIX_LENGTH {
                let prefix = normalized_tag.chars().take(PREFIX_LENGTH).collect::<String>();
                
                TAG_PREFIXES.with(|prefixes| {
                    let mut prefix_map = prefixes.borrow_mut();
                    let mut tags = prefix_map.get(&prefix).unwrap_or_default();
                    
                    if !tags.0.contains(&normalized_tag) {
                        tags.0.push(normalized_tag.clone());
                        prefix_map.insert(prefix, tags);
                    }
                });
            }
        }
    });
    
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
    if items.len() > 500 {
        return Err("Cannot create shelf with more than 500 items".to_string());
    }
    
    // Validate tags if provided
    let validated_tags = if let Some(tag_list) = tags {
        if tag_list.len() > MAX_TAGS_PER_SHELF {
            return Err(format!("Maximum of {} tags per shelf", MAX_TAGS_PER_SHELF));
        }
        
        // Validate each tag
        for tag in &tag_list {
            validate_tag(tag)?;
        }
        
        tag_list
    } else {
        Vec::new()
    };
    
    let now = ic_cdk::api::time();
    let owner = ic_cdk::caller();  // Get caller here
    let shelf_id = utils::generate_shelf_id(&owner).await;

    // Create shelf with generated ID
    let mut shelf = Shelf {
        shelf_id: shelf_id.clone(),
        title,
        description,
        owner,  // Use derived owner
        editors: Vec::new(), // Initialize editors as empty vector
        items: BTreeMap::new(),
        item_positions: BTreeMap::new(),
        created_at: now,
        updated_at: now,
        needs_rebalance: false,
        rebalance_count: 0,
        appears_in: Vec::new(), // Initialize appears_in as empty vector
        tags: validated_tags.clone(), // Initialize tags
    };

    // Add items with proper ordering
    for item in items {
        shelf.insert_item(item)?;
    }
    
    // Update tag tracking for each tag
    for tag in &validated_tags {
        add_tag_to_tracking(tag, &shelf_id)?;
    }

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

// Check if a user has hit their tag rate limit
pub fn check_tag_rate_limit(user: &Principal) -> Result<(), String> {
    let now = ic_cdk::api::time();
    
    USER_TAG_COUNTS.with(|counts| {
        let mut counts_map = counts.borrow_mut();
        
        // Get or initialize the user's count
        let (last_reset, count) = counts_map
            .get(user)
            .cloned()
            .unwrap_or((now, 0));
        
        // Check if we should reset the window
        let (new_last_reset, new_count) = if now - last_reset > TAG_RATE_LIMIT_WINDOW {
            (now, 1) // Reset window and count
        } else if count >= MAX_TAGS_PER_USER {
            return Err(format!(
                "Rate limit exceeded. Maximum {} tags per {} hours", 
                MAX_TAGS_PER_USER, 
                TAG_RATE_LIMIT_WINDOW / (60 * 60 * 1_000_000_000)
            ));
        } else {
            (last_reset, count + 1) // Increment within current window
        };
        
        // Update the counter
        counts_map.insert(*user, (new_last_reset, new_count));
        
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