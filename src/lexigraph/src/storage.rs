use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;
use std::collections::BTreeMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage maps
const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);

const MAX_VALUE_SIZE: u32 = 1000; // Added constant for consistency

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
}

// Updated Shelf structure
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SlotContent {
    Nft(String), // NFT ID
    Markdown(String), // Markdown text
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Slot {
    pub id: u32, // Unique slot ID
    pub content: SlotContent,
    pub position: u32, // Display order
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shelf {
    pub shelf_id: String,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub slots: BTreeMap<u32, Slot>, // Slots stored by ID
    pub slot_order: BTreeMap<u32, u32>, // Map: position -> slot_id
    pub created_at: u64,
    pub updated_at: u64,
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
        if self.slots.contains_key(&slot.id) {
            return Err("Slot ID already exists".to_string());
        }

        // Find the next available position
        let position = self.slot_order.keys().last().map_or(0, |&p| p + 1);

        // Insert the slot
        let slot_id = slot.id; // Store id before moving
        self.slots.insert(slot_id, slot);
        self.slot_order.insert(position, slot_id);
        Ok(())
    }

    pub fn move_slot(&mut self, slot_id: u32, new_position: u32) -> Result<(), String> {
        if !self.slots.contains_key(&slot_id) {
            return Err("Slot not found".to_string());
        }

        // Remove the slot from its current position
        let current_position = self.slot_order.iter()
            .find(|(_, &id)| id == slot_id)
            .map(|(&p, _)| p)
            .ok_or("Slot position not found")?;

        self.slot_order.remove(&current_position);

        // Insert the slot at the new position
        self.slot_order.insert(new_position, slot_id);
        Ok(())
    }

    pub fn get_ordered_slots(&self) -> Vec<Slot> {
        self.slot_order.iter()
            .filter_map(|(_, &id)| self.slots.get(&id).cloned())
            .collect()
    }
}

// Update store_shelf function
pub fn store_shelf(shelf: Shelf) -> Result<(), String> {
    let now = ic_cdk::api::time();
    
    let mut shelf = shelf.clone(); // Clone the shelf
    shelf.created_at = now;
    shelf.updated_at = now;

    // Store NFT references
    for slot in shelf.slots.values() {
        if let SlotContent::Nft(nft_id) = &slot.content {
            NFT_SHELVES.with(|nft_shelves| {
                let mut nft_map = nft_shelves.borrow_mut();
                let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                shelves.0.push(shelf.shelf_id.clone());
                nft_map.insert(nft_id.clone(), shelves);
            });
        }
    }

    SHELVES.with(|shelves| {
        shelves.borrow_mut().insert(shelf.shelf_id.clone(), shelf.clone());
    });

    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&shelf.owner).unwrap_or_default();
        user_shelves_set.0.insert((now, shelf.shelf_id.clone()));
        user_map.insert(shelf.owner, user_shelves_set);
    });

    Ok(())
}

// Update update_shelf function
pub fn update_shelf(shelf_id: String, updates: ShelfUpdate) -> Result<(), String> {
    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        if let Some(mut shelf) = shelves_map.get(&shelf_id) {
            if shelf.owner != ic_cdk::caller() {
                return Err("Unauthorized: Only shelf owner can update".to_string());
            }

            if let Some(title) = updates.title {
                shelf.title = title;
            }
            shelf.description = updates.description;

            if let Some(new_slots) = updates.slots {
                // Handle NFT reference updates
                let old_nfts: Vec<String> = shelf.slots.values()
                    .filter_map(|slot| match &slot.content {
                        SlotContent::Nft(id) => Some(id.clone()),
                        _ => None
                    })
                    .collect();

                let new_nfts: Vec<String> = new_slots.iter()
                    .filter_map(|slot| match &slot.content {
                        SlotContent::Nft(id) => Some(id.clone()),
                        _ => None
                    })
                    .collect();

                // Remove old NFT references
                for nft_id in old_nfts.iter().filter(|id| !new_nfts.contains(id)) {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        if let Some(mut shelves) = nft_map.get(nft_id) {
                            shelves.0.retain(|id| id != &shelf_id);
                            nft_map.insert(nft_id.clone(), shelves);
                        }
                    });
                }

                // Add new NFT references
                for nft_id in new_nfts.iter().filter(|id| !old_nfts.contains(id)) {
                    NFT_SHELVES.with(|nft_shelves| {
                        let mut nft_map = nft_shelves.borrow_mut();
                        let mut shelves = nft_map.get(nft_id).unwrap_or_default();
                        shelves.0.push(shelf.shelf_id.clone());
                        nft_map.insert(nft_id.clone(), shelves);
                    });
                }

                // Update slots
                shelf.slots.clear();
                for slot in new_slots {
                    shelf.slots.insert(slot.id, slot);
                }
            }

            shelf.updated_at = ic_cdk::api::time();
            shelves_map.insert(shelf_id, shelf);
            Ok(())
        } else {
            Err("Shelf not found".to_string())
        }
    })
}

#[derive(CandidType, Deserialize)]
pub struct ShelfUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub slots: Option<Vec<Slot>>,
}
