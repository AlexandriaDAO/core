use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::collections::{BTreeMap, BTreeSet};
use std::cell::RefCell; // Required for SHELVES.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::{ShelfId, ItemId, NormalizedTag, MAX_TAGS_PER_SHELF, MAX_NFT_ID_LENGTH, MAX_ITEMS_PER_SHELF, MAX_MARKDOWN_LENGTH, SHELF_ITEM_STEP_SIZE, MAX_APPEARS_IN_COUNT};

// Imports from other parts of the crate
use crate::ordering::PositionTracker;
// create_shelf specific imports
use crate::utils::normalize_tag; // For create_shelf via Shelf::with_tags
use sha2::{Sha256, Digest};
use bs58;

// Import re-exported items from storage module for tag constants/validation
use crate::storage::{validate_tag_format};

// --- Define ShelfMetadata ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfMetadata {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

impl Storable for ShelfMetadata {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
    const BOUND: Bound = Bound::Unbounded;
}

// --- Define ShelfContent ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfContentSerializable {
    pub items: BTreeMap<u32, Item>,
    pub item_positions: Vec<(u32, f64)>,
}

#[derive(Clone, Debug)]
pub struct ShelfContent {
    pub items: BTreeMap<u32, Item>,
    pub item_positions: PositionTracker<u32>,
}

impl Storable for ShelfContent {
    fn to_bytes(&self) -> Cow<[u8]> {
        let serializable = ShelfContentSerializable {
            items: self.items.clone(),
            item_positions: self.item_positions.get_ordered_entries(),
        };
        Cow::Owned(Encode!(&serializable).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let serializable: ShelfContentSerializable = Decode!(bytes.as_ref(), ShelfContentSerializable).unwrap();
        let mut item_positions = PositionTracker::<u32>::new();
        for (key, pos) in serializable.item_positions {
            item_positions.insert(key, pos);
        }
        Self {
            items: serializable.items,
            item_positions,
        }
    }
    const BOUND: Bound = Bound::Unbounded;
}

// Manual implementation of CandidType for ShelfContent
impl candid::CandidType for ShelfContent {
    fn _ty() -> candid::types::Type {
        ShelfContentSerializable::_ty()
    }

    fn idl_serialize<S>(&self, serializer: S) -> Result<(), S::Error>
    where
        S: candid::types::Serializer,
    {
        let serializable = ShelfContentSerializable {
            items: self.items.clone(),
            item_positions: self.item_positions.get_ordered_entries(),
        };
        serializable.idl_serialize(serializer)
    }
}

// Manual implementation of Deserialize for ShelfContent
impl<'de> serde::Deserialize<'de> for ShelfContent {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let serializable = ShelfContentSerializable::deserialize(deserializer)?;
        let mut item_positions = PositionTracker::<u32>::new();
        for (key, pos) in serializable.item_positions {
            // It's possible insert could fail if PositionTracker has such logic,
            // but assuming it's straightforward for deserialization context.
            item_positions.insert(key, pos);
        }
        Ok(Self {
            items: serializable.items,
            item_positions,
        })
    }
}

// --- Define ShelfData (New combined structure) ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfData {
    pub metadata: ShelfMetadata,
    pub content: ShelfContent,
}

impl Storable for ShelfData {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// --- ItemContent and Item types ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ItemContent {
    Nft(String), // NFT ID
    Markdown(String), // Markdown text
    Shelf(ShelfId), // Shelf ID - allows nesting shelves
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Item {
    pub id: ItemId, // Unique item ID (u32)
    pub content: ItemContent,
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

// --- Global Timeline items ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct GlobalTimelineItemValue {
    pub shelf_id: ShelfId,
    pub owner: Principal,
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

impl Storable for GlobalTimelineItemValue {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// --- Shelf Public structure ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfPublic {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<u32, Item>,
    pub item_positions: Vec<(u32, f64)>,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

impl ShelfPublic {
    pub fn from_internal(shelf: &Shelf) -> Self {
        Self {
            shelf_id: shelf.shelf_id.clone(),
            title: shelf.title.clone(),
            description: shelf.description.clone(),
            owner: shelf.owner.clone(),
            items: shelf.items.clone(),
            item_positions: shelf.item_positions.get_ordered_entries(),
            created_at: shelf.created_at,
            updated_at: shelf.updated_at,
            appears_in: shelf.appears_in.clone(),
            tags: shelf.tags.clone(),
            public_editing: shelf.public_editing,
        }
    }
    pub fn from_parts(metadata: &ShelfMetadata, content: &ShelfContent) -> Self {
        Self {
            shelf_id: metadata.shelf_id.clone(),
            title: metadata.title.clone(),
            description: metadata.description.clone(),
            owner: metadata.owner.clone(),
            items: content.items.clone(),
            item_positions: content.item_positions.get_ordered_entries(),
            created_at: metadata.created_at,
            updated_at: metadata.updated_at,
            appears_in: metadata.appears_in.clone(),
            tags: metadata.tags.clone(),
            public_editing: metadata.public_editing,
        }
    }
}

// --- Main Shelf struct ---
#[derive(Clone, Debug)]
pub struct Shelf {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<ItemId, Item>,
    pub item_positions: PositionTracker<ItemId>,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<ShelfId>,
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

// Memory IDs
pub(crate) const SHELVES_MEM_ID: MemoryId = MemoryId::new(0);
pub(crate) const GLOBAL_TIMELINE_MEM_ID: MemoryId = MemoryId::new(3);
pub(crate) const SHELF_METADATA_MEM_ID: MemoryId = MemoryId::new(20);
pub(crate) const SHELF_DATA_MEM_ID: MemoryId = MemoryId::new(21);

thread_local! {
    pub static SHELF_DATA: RefCell<StableBTreeMap<ShelfId, ShelfData, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(SHELF_DATA_MEM_ID))
        )
    );
    pub static GLOBAL_TIMELINE: RefCell<StableBTreeMap<u64, GlobalTimelineItemValue, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GLOBAL_TIMELINE_MEM_ID))
        )
    );
}

// --- Shelf Impl ---
impl Shelf {
    pub fn new(shelf_id: ShelfId, title: String, owner: Principal) -> Self {
        let now = ic_cdk::api::time();
        Self {
            shelf_id,
            title,
            description: None,
            owner,
            items: BTreeMap::new(),
            item_positions: PositionTracker::new(),
            created_at: now,
            updated_at: now,
            appears_in: Vec::new(),
            tags: Vec::new(),
            public_editing: false,
        }
    }

    pub fn with_description(mut self, description: Option<String>) -> Self {
        self.description = description;
        self
    }

    pub fn with_tags(mut self, normalized_tags: Vec<NormalizedTag>) -> Self {
        // Assumes tags are already normalized and validated by caller
        self.tags = normalized_tags.into_iter().take(MAX_TAGS_PER_SHELF).collect();
        self
    }

    pub fn insert_item(&mut self, item: Item) -> Result<(), String> {
        if self.item_positions.len() >= MAX_ITEMS_PER_SHELF {
            return Err(format!("Maximum item limit reached ({})", MAX_ITEMS_PER_SHELF));
        }
        match &item.content {
            ItemContent::Nft(nft_id) => {
                if nft_id.chars().any(|c| !c.is_digit(10)) {
                     return Err("Invalid NFT ID: Contains non-digit characters.".to_string());
                }
                if nft_id.len() > MAX_NFT_ID_LENGTH {
                    return Err(format!("NFT ID exceeds maximum length of {} characters", MAX_NFT_ID_LENGTH));
                }
            }
            ItemContent::Markdown(markdown) => {
                if markdown.len() > MAX_MARKDOWN_LENGTH {
                     return Err(format!("Markdown content exceeds maximum length of {} characters", MAX_MARKDOWN_LENGTH));
                }
            }
            ItemContent::Shelf(nested_shelf_id) => {
                if nested_shelf_id == &self.shelf_id {
                    return Err("Circular reference: A shelf cannot contain itself".to_string());
                }
                let nested_contains_self = SHELF_DATA.with(|map_ref| {
                    map_ref.borrow().get(nested_shelf_id).map_or(false, |shelf_data| {
                        shelf_data.content.items.values().any(|nested_item| {
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
        let item_id = item.id;
        let new_position = self.item_positions.calculate_position(
            None,
            false,
            SHELF_ITEM_STEP_SIZE
        )?;
        self.item_positions.insert(item_id, new_position);
        self.items.insert(item_id, item);
        Ok(())
    }

    pub fn move_item(&mut self, item_id: u32, reference_item_id: Option<u32>, before: bool) -> Result<(), String> {
        if !self.item_positions.contains_key(&item_id) {
             if self.items.contains_key(&item_id) {
                  ic_cdk::println!("ERROR: Item {} found in items map but not in position tracker for shelf {}", item_id, self.shelf_id);
                  return Err("Internal state inconsistency: Item position missing".to_string());
             }
             return Err("Item not found".to_string());
        }
        if let Some(ref_id) = reference_item_id {
             if !self.item_positions.contains_key(&ref_id) {
                 return Err("Reference item not found".to_string());
             }
        }
        let new_position = self.item_positions.calculate_position(
            reference_item_id.as_ref(),
            before,
            SHELF_ITEM_STEP_SIZE
        )?;
        self.item_positions.insert(item_id, new_position);
        Ok(())
    }

    pub fn get_ordered_items(&self) -> Vec<Item> {
        self.item_positions
            .iter_keys_ordered()
            .filter_map(|item_id| self.items.get(item_id).cloned())
            .collect()
    }
    
    pub fn rebalance_positions(&mut self) {
        self.item_positions.rebalance_positions(SHELF_ITEM_STEP_SIZE);
    }
}

// --- ShelfBackupData ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfBackupData {
    pub shelf_id: ShelfId,
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<u32, Item>,
    pub item_positions: Vec<(u32, f64)>,
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

impl ShelfBackupData {
    pub fn from_internal(shelf: &Shelf) -> Self {
        Self {
            shelf_id: shelf.shelf_id.clone(),
            title: shelf.title.clone(),
            description: shelf.description.clone(),
            owner: shelf.owner.clone(),
            items: shelf.items.clone(),
            item_positions: shelf.item_positions.get_ordered_entries(),
            tags: shelf.tags.clone(),
            public_editing: shelf.public_editing,
        }
    }
}


// --- create_shelf function ---
pub async fn create_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>, 
) -> Result<Shelf, String> {
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
    
    let mut normalized_tags_for_shelf = Vec::new();
    if let Some(tag_list) = tags {
        if tag_list.len() > MAX_TAGS_PER_SHELF {
            return Err(format!("Too many tags provided (max {})", MAX_TAGS_PER_SHELF));
        }
        
        let mut unique_normalized = BTreeSet::new(); // Use std::collections::BTreeSet
        for tag_str in tag_list {
            let normalized = normalize_tag(&tag_str); // from crate::utils
            validate_tag_format(&normalized)?; // Use imported function
            unique_normalized.insert(normalized);
        }
        normalized_tags_for_shelf = unique_normalized.into_iter().collect();
    }
    
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();
    
    let shelf_id = {
        let mut hasher = Sha256::new();
        let id_input = format!("{}:{}:{}", caller.to_text(), now, title);
        hasher.update(id_input.as_bytes());
        let hash = hasher.finalize();
        bs58::encode(hash).into_string()
    };
    
    let mut shelf = Shelf::new(shelf_id.clone(), title, caller)
        .with_description(description)
        .with_tags(normalized_tags_for_shelf); 
    
    for item in items {
        shelf.insert_item(item)?;
    }
    
    Ok(shelf)
} 