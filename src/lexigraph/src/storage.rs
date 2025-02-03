use candid::{CandidType, Principal};
use candid::{Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::BTreeSet;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage maps
const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
const USER_SHELVES_MEM_ID: MemoryId = MemoryId::new(1);
const NFT_SHELVES_MEM_ID: MemoryId = MemoryId::new(2);

const MAX_VALUE_SIZE: u32 = 1000; // Added constant for consistency

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

    // User shelves index: K: Principal, V: BTreeSet<(nanos, shelf_id)>
    pub static USER_SHELVES: RefCell<StableBTreeMap<Principal, BTreeSet<(u64, String)>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_SHELVES_MEM_ID))
        )
    );

    // NFT shelves index: K: nft_id, V: Vec<shelf_id>
    pub static NFT_SHELVES: RefCell<StableBTreeMap<String, Vec<String>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(NFT_SHELVES_MEM_ID))
        )
    );
}

// Updated Shelf structure
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shelf {
    pub shelf_id: String,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub nfts: Vec<String>,
    pub blog_view: Option<Vec<BlogSlot>>,
    pub created_at: u64,
    pub updated_at: u64,
}

// Blog slot structure
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BlogSlot {
    pub markdown: String,
    pub position: u32, // Position relative to NFTs
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

// Implement Storable for BlogSlot
impl Storable for BlogSlot {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 512, // Adjust based on expected markdown size
        is_fixed_size: false,
    };
}

// Update store_shelf function to handle the renamed field
pub fn store_shelf(shelf: Shelf) -> Result<(), String> {
    let now = ic_cdk::api::time();
    
    // Create a new shelf with updated timestamps
    let mut shelf = shelf;
    shelf.created_at = now;
    shelf.updated_at = now;

    SHELVES.with(|shelves| {
        let mut shelves_map = shelves.borrow_mut();
        shelves_map.insert(shelf.shelf_id.clone(), shelf.clone());
    });

    USER_SHELVES.with(|user_shelves| {
        let mut user_map = user_shelves.borrow_mut();
        let mut user_shelves_set = user_map.get(&shelf.owner).unwrap_or_default();
        user_shelves_set.insert((now, shelf.shelf_id.clone()));
        user_map.insert(shelf.owner, user_shelves_set);
    });

    for nft_id in &shelf.nfts {
        NFT_SHELVES.with(|nft_shelves| {
            let mut nft_map = nft_shelves.borrow_mut();
            let mut shelves = nft_map.get(nft_id).unwrap_or_default();
            shelves.push(shelf.shelf_id.clone());
            nft_map.insert(nft_id.clone(), shelves);
        });
    }

    Ok(())
}

// Update update_shelf function to handle optional description
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
            if let Some(nfts) = updates.nfts {
                shelf.nfts = nfts;
            }
            if let Some(blog_view) = updates.blog_view {
                shelf.blog_view = blog_view;
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
    pub nfts: Option<Vec<String>>,
    pub blog_view: Option<Vec<BlogSlot>>,
}
