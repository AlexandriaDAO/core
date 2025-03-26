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

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage maps
const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);
const GLOBAL_TIMELINE_MEM_ID: MemoryId = MemoryId::new(3);

const MAX_VALUE_SIZE: u32 = 8192; // 8kb should be good for a decent sized markdown file.

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
    
    // User profile shelf order: K: Principal, V: UserProfileOrder
    pub static USER_PROFILE_ORDER: RefCell<BTreeMap<Principal, UserProfileOrder>> = RefCell::new(BTreeMap::new());
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

// Modified create_shelf to use caller principal
pub async fn create_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
) -> Result<Shelf, String> {
    if items.len() > 500 {
        return Err("Cannot create shelf with more than 500 items".to_string());
    }
    let now = ic_cdk::api::time();
    let owner = ic_cdk::caller();  // Get caller here
    let shelf_id = utils::generate_shelf_id(&owner).await;

    // Create shelf with generated ID
    let mut shelf = Shelf {
        shelf_id,
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
    };

    // Add items with proper ordering
    for item in items {
        shelf.insert_item(item)?;
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