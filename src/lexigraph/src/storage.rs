use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;
use crate::utils;

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
}

// Updated Shelf structure
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SlotContent {
    Nft(String), // NFT ID
    Markdown(String), // Markdown text
    Shelf(String), // Shelf ID - allows nesting shelves
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Slot {
    pub id: u32, // Unique slot ID
    pub content: SlotContent,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shelf {
    pub shelf_id: String,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub editors: Vec<Principal>,      // List of principals with edit access
    pub slots: BTreeMap<u32, Slot>,      // Slots stored by ID
    pub slot_positions: BTreeMap<u32, f64>, // Map: slot_id -> position number
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

impl Storable for Slot {
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

impl Shelf {
    pub fn insert_slot(&mut self, slot: Slot) -> Result<(), String> {
        if self.slots.len() >= 500 {
            return Err("Maximum slot limit reached (500)".to_string());
        }
        
        // Check for circular references
        if let SlotContent::Shelf(ref nested_shelf_id) = slot.content {
            // Prevent a shelf from containing itself
            if nested_shelf_id == &self.shelf_id {
                return Err("Circular reference: A shelf cannot contain itself".to_string());
            }
            
            // Check for deeper circular references by traversing the shelf hierarchy
            if self.has_circular_reference(nested_shelf_id) {
                return Err("Circular reference detected in shelf hierarchy".to_string());
            }
        }
        
        let slot_id = slot.id;
        
        // Initialize position at the end
        let new_position = self.slot_positions.values()
            .max_by(|a, b| a.partial_cmp(b).unwrap())
            .map_or(0.0, |pos| pos + 1.0);
            
        // Update the float position
        self.slot_positions.insert(slot_id, new_position);
        
        // Store the slot without a position field
        self.slots.insert(slot_id, slot);
        
        // Check if we need rebalancing (when there are many slots)
        if self.slots.len() > 100 {
            self.check_position_spacing();
        }
        
        Ok(())
    }

    // Helper method to check for circular references in the shelf hierarchy
    fn has_circular_reference(&self, shelf_id: &str) -> bool {
        // Check if any slot in the current shelf contains the target shelf
        for slot in self.slots.values() {
            if let SlotContent::Shelf(nested_id) = &slot.content {
                // If this slot contains the shelf we're checking, we have a circular reference
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

    pub fn move_slot(&mut self, slot_id: u32, reference_slot_id: Option<u32>, before: bool) -> Result<(), String> {
        // First verify the slot exists
        if !self.slots.contains_key(&slot_id) {
            return Err("Slot not found".to_string());
        }

        // Get current positions
        let positions: Vec<(u32, f64)> = self.slot_positions.iter()
            .map(|(&id, &pos)| (id, pos))
            .collect();
            
        let new_position = match reference_slot_id {
            Some(ref_id) => {
                // Verify reference slot exists
                let reference_pos = self.slot_positions.get(&ref_id)
                    .ok_or("Reference slot not found")?;
                
                // Calculate new position based on neighbor
                if before {
                    self.find_previous_position(*reference_pos)
                } else {
                    self.find_next_position(*reference_pos)
                }
            }
            None => {
                // Move to start/end
                if before {
                    self.slot_positions.values()
                        .fold(f64::INFINITY, |a, &b| a.min(b)) - 1.0
                } else {
                    self.slot_positions.values()
                        .fold(f64::NEG_INFINITY, |a, &b| a.max(b)) + 1.0
                }
            }
        };

        // Update the float position
        self.slot_positions.insert(slot_id, new_position);
        
        // Check if positions have become too close, requiring rebalancing
        self.check_position_spacing();

        Ok(())
    }

    fn find_previous_position(&self, target: f64) -> f64 {
        let prev = self.slot_positions.values()
            .filter(|&&pos| pos < target)
            .max_by(|a, b| a.partial_cmp(b).unwrap());
            
        match prev {
            Some(prev_pos) => (prev_pos + target) / 2.0,
            None => target - 1.0
        }
    }

    fn find_next_position(&self, target: f64) -> f64 {
        let next = self.slot_positions.values()
            .filter(|&&pos| pos > target)
            .min_by(|a, b| a.partial_cmp(b).unwrap());
            
        match next {
            Some(next_pos) => (target + next_pos) / 2.0,
            None => target + 1.0
        }
    }

    pub fn get_ordered_slots(&self) -> Vec<Slot> {
        let mut ordered: Vec<_> = self.slot_positions.iter().collect();
        ordered.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
        
        // Create a new vector with cloned slots in the correct order
        ordered.into_iter()
            .filter_map(|(id, _)| {
                self.slots.get(id).map(|slot| slot.clone())
            })
            .collect()
    }
    
    // Checks if positions have become too close, potentially requiring rebalancing
    fn check_position_spacing(&mut self) {
        if self.slots.len() < 2 {
            return;
        }
        
        let mut positions: Vec<f64> = self.slot_positions.values().cloned().collect();
        positions.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        // Check minimum gap between consecutive positions
        let mut min_gap = f64::MAX;
        for i in 1..positions.len() {
            let gap = positions[i] - positions[i-1];
            min_gap = min_gap.min(gap);
        }
        
        // If minimum gap is too small, mark for rebalancing
        // We use a smaller threshold when we have more slots
        let threshold = match self.slots.len() {
            n if n > 400 => 1e-10,
            n if n > 200 => 1e-8,
            _ => 1e-6
        };
        
        if min_gap < threshold {
            self.needs_rebalance = true;
        }
    }
    
    // Rebalances all slot positions to be evenly distributed
    pub fn rebalance_positions(&mut self) {
        if self.slots.is_empty() {
            return;
        }
        
        // Get current ordering
        let mut ordered_ids: Vec<u32> = Vec::new();
        let mut ordered: Vec<_> = self.slot_positions.iter().collect();
        ordered.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap());
        
        for (&id, _) in ordered {
            ordered_ids.push(id);
        }
        
        // Reset positions to be evenly spaced between 0 and (slots × 1000)
        let step_size = 1000.0;
        for (i, slot_id) in ordered_ids.into_iter().enumerate() {
            self.slot_positions.insert(slot_id, (i as f64) * step_size);
        }
        
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
    slots: Vec<Slot>,
) -> Result<Shelf, String> {
    if slots.len() > 500 {
        return Err("Cannot create shelf with more than 500 slots".to_string());
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
        slots: BTreeMap::new(),
        slot_positions: BTreeMap::new(),
        created_at: now,
        updated_at: now,
        needs_rebalance: false,
        rebalance_count: 0,
    };

    // Add slots with proper ordering
    for slot in slots {
        shelf.insert_slot(slot)?;
    }

    Ok(shelf)
}