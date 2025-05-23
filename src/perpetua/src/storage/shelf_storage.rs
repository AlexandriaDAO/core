use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::collections::{BTreeMap, BTreeSet};
use std::cell::RefCell; // Required for SHELVES.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::{ShelfId as CommonShelfId, ItemId, NormalizedTag, MAX_TAGS_PER_SHELF, MAX_NFT_ID_LENGTH, MAX_ITEMS_PER_SHELF, MAX_MARKDOWN_LENGTH, SHELF_ITEM_STEP_SIZE, MAX_APPEARS_IN_COUNT};

// Imports from other parts of the crate
use crate::ordering::PositionTracker;
// create_shelf specific imports
use crate::utils::normalize_tag; // For create_shelf via Shelf::with_tags
use sha2::{Sha256, Digest};
use bs58;

// Import re-exported items from storage module for tag constants/validation
use crate::storage::{validate_tag_format};

// Import additional items from storage module
use crate::storage::error_log_storage; // Added for init_next_task_id. ShelfId from here is not used directly in this file's scope.
use crate::storage::error_log_storage::{add_reconciliation_task, ReconciliationTaskType};
use rand::Rng; // For random number generation if not already there

// --- Define ShelfMetadata ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfMetadata {
    pub shelf_id: CommonShelfId, // Using aliased ShelfId
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<CommonShelfId>, // Using aliased ShelfId
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

// --- Migration Statistics Structure ---
// #[derive(CandidType, Deserialize, Debug)]
// pub struct MigrationReport {
//     pub successfully_migrated: u64,
//     pub already_migrated: u64,
//     pub orphaned_metadata: Vec<ShelfId>,
//     pub orphaned_content: Vec<ShelfId>,
//     pub total_metadata_found: u64,
//     pub total_content_found: u64,
//     pub total_in_new_structure: u64,
//     pub migration_timestamp: u64,
// }

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
    Shelf(CommonShelfId), // Shelf ID - allows nesting shelves
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
    pub shelf_id: CommonShelfId, // Using aliased ShelfId
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
    pub shelf_id: CommonShelfId, // Using aliased ShelfId
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<u32, Item>,
    pub item_positions: Vec<(u32, f64)>,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<CommonShelfId>, // Using aliased ShelfId
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
    pub shelf_id: CommonShelfId, // Using aliased ShelfId
    pub title: String,
    pub description: Option<String>,
    pub owner: Principal,
    pub items: BTreeMap<ItemId, Item>,
    pub item_positions: PositionTracker<ItemId>,
    pub created_at: u64,
    pub updated_at: u64,
    pub appears_in: Vec<CommonShelfId>, // Using aliased ShelfId
    pub tags: Vec<NormalizedTag>,
    pub public_editing: bool,
}

// Memory IDs
// Historical note: Memory IDs 0 and 20 were previously used for
// SHELVES and SHELF_METADATA respectively. These were migrated to
// SHELF_DATA (Memory ID 21) in commit [commit_hash].
// These IDs are now available for future use.
pub(crate) const SHELF_DATA_MEM_ID: MemoryId = MemoryId::new(21);
pub(crate) const GLOBAL_TIMELINE_MEM_ID: MemoryId = MemoryId::new(3);

thread_local! {
    pub static SHELF_DATA: RefCell<StableBTreeMap<CommonShelfId, ShelfData, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(SHELF_DATA_MEM_ID))
        )
    );
    pub static GLOBAL_TIMELINE: RefCell<StableBTreeMap<u64, GlobalTimelineItemValue, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(GLOBAL_TIMELINE_MEM_ID))
        )
    );

    // Temporary: Old storage structures for migration
    // pub(crate) static SHELVES_OLD: RefCell<StableBTreeMap<ShelfId, ShelfContent, Memory>> = RefCell::new(
    //     StableBTreeMap::init(
    //         MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))) // Corresponds to SHELVES_MEM_ID
    //     )
    // );
    
    // pub(crate) static SHELF_METADATA_OLD: RefCell<StableBTreeMap<ShelfId, ShelfMetadata, Memory>> = RefCell::new(
    //     StableBTreeMap::init(
    //         MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(20))) // Corresponds to SHELF_METADATA_MEM_ID
    //     )
    // );
}

// --- Shelf Impl ---
impl Shelf {
    pub fn new(shelf_id: CommonShelfId, title: String, owner: Principal) -> Self {
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
    pub shelf_id: CommonShelfId,
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

// Function to be called in canister init/post_upgrade
pub fn init_persistent_data() {
    error_log_storage::init_next_task_id();
    // Add other initializations if necessary
}

// --- Admin functions for reconciliation ---

/// Returns the total number of shelves in SHELF_DATA.
/// Used for paginating the rebuild process.
pub fn get_shelf_data_count() -> u64 {
    SHELF_DATA.with(|sd| sd.borrow().len())
}

/// Admin function to rebuild a batch of the GLOBAL_TIMELINE from SHELF_DATA.
/// This should be callable by an authorized principal (e.g., canister controller).
/// 
/// Args:
/// - `offset`: The starting index for shelves to process from SHELF_DATA.
/// - `limit`: The maximum number of shelves to process in this batch.
///
/// Returns: Result<(u64, u64), String>
/// - Ok((processed_count, total_shelves_in_data)) if successful.
/// - Err(String) on failure.
pub fn rebuild_global_timeline_batch_admin(offset: u64, limit: u64) -> Result<(u64, u64), String> {
    let mut processed_count = 0u64;
    let total_shelves = get_shelf_data_count();

    if offset >= total_shelves && total_shelves > 0 { // Allow offset == 0 for empty shelf data
        return Err("Offset is out of bounds.".to_string());
    }
    if limit == 0 {
        return Err("Limit must be greater than 0.".to_string());
    }

    // Clear GLOBAL_TIMELINE if it's the first batch. 
    // This is a simple strategy; more sophisticated merging could be done.
    if offset == 0 {
        GLOBAL_TIMELINE.with(|gt_ref| 
            *gt_ref.borrow_mut() = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(GLOBAL_TIMELINE_MEM_ID)))
        );
        ic_cdk::println!("GLOBAL_TIMELINE cleared for rebuild.");
    }

    let shelf_data_entries: Vec<(CommonShelfId, ShelfData)> = SHELF_DATA.with(|sd_ref| {
        sd_ref.borrow()
            .iter()
            .skip(offset as usize)
            .take(limit as usize)
            .map(|(k, v)| (k.clone(), v.clone())) // Clone to work with owned data
            .collect()
    });

    if shelf_data_entries.is_empty() && total_shelves > 0 && offset < total_shelves {
        ic_cdk::println!(
            "Warning: rebuild_global_timeline_batch_admin - No entries fetched for offset {}, limit {}. Total shelves: {}.",
            offset, limit, total_shelves
        );
        return Ok((0, total_shelves));
    } else if shelf_data_entries.is_empty() && total_shelves == 0 {
        ic_cdk::println!("No shelves in SHELF_DATA to process for GLOBAL_TIMELINE.");
        return Ok((0, total_shelves));
    }

    GLOBAL_TIMELINE.with(|gt_ref| {
        let mut timeline = gt_ref.borrow_mut();
        for (shelf_id, shelf_data) in shelf_data_entries {
            let timeline_value = GlobalTimelineItemValue {
                shelf_id: shelf_id.clone(),
                owner: shelf_data.metadata.owner,
                tags: shelf_data.metadata.tags.clone(),
                public_editing: shelf_data.metadata.public_editing,
            };
            timeline.insert(shelf_data.metadata.updated_at, timeline_value);
            processed_count += 1;
        }
    });

    ic_cdk::println!(
        "Rebuilt GLOBAL_TIMELINE batch: {} shelves processed. Offset: {}, Limit: {}. Total shelves in data: {}.",
        processed_count, offset, limit, total_shelves
    );
    Ok((processed_count, total_shelves))
}

// --- create_shelf function ---
pub async fn create_shelf(
    title: String,
    description: Option<String>,
    items: Vec<Item>,
    tags: Option<Vec<String>>, 
) -> Result<(CommonShelfId, Option<u64>), String> {
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
        
        let mut unique_normalized = BTreeSet::new();
        for tag_str in tag_list {
            let normalized = normalize_tag(&tag_str);
            validate_tag_format(&normalized)?;
            unique_normalized.insert(normalized);
        }
        normalized_tags_for_shelf = unique_normalized.into_iter().collect();
    }
    
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();
    
    let shelf_id_str = {
        let mut hasher = Sha256::new();
        // Add a random u32 to further ensure uniqueness for simultaneous creations
        let random_suffix: u32 = rand::thread_rng().gen();
        let id_input = format!("{}:{}:{}:{}", caller.to_text(), now, title, random_suffix);
        hasher.update(id_input.as_bytes());
        let hash = hasher.finalize();
        bs58::encode(hash).into_string()
    };
    let shelf_id: CommonShelfId = shelf_id_str; 
    
    let mut shelf_internal = Shelf::new(shelf_id.clone(), title.clone(), caller)
        .with_description(description.clone())
        .with_tags(normalized_tags_for_shelf.clone()); 
    
    let mut temp_items_map = BTreeMap::new();
    let mut temp_pos_tracker = PositionTracker::<ItemId>::new();
    let mut next_item_id_counter = 0u32;

    for item_input in items {
        // Assign a new ID to the item within the context of this new shelf
        // This assumes ItemId is u32. If ItemId comes pre-assigned and should be globally unique,
        // this logic needs adjustment.
        let new_item_id = next_item_id_counter;
        next_item_id_counter += 1;

        let item_to_insert = Item {
            id: new_item_id, // Overwrite or assign ID here
            content: item_input.content, // Assuming Item passed in has content but maybe not final ID
        };

        // Validate item content (simplified from Shelf::insert_item)
        match &item_to_insert.content {
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
                if nested_shelf_id == &shelf_id {
                    return Err("Circular reference: A shelf cannot contain itself".to_string());
                }
                // Deeper circular reference check might be too complex for this stage;
                // relying on runtime checks during item addition if shelves can be deeply nested.
            }
        }
        let new_position = temp_pos_tracker.calculate_position(None, false, SHELF_ITEM_STEP_SIZE)?;
        temp_pos_tracker.insert(new_item_id, new_position);
        temp_items_map.insert(new_item_id, item_to_insert);
    }
    shelf_internal.items = temp_items_map;
    shelf_internal.item_positions = temp_pos_tracker;
    shelf_internal.updated_at = now; // Ensure updated_at is set

    // --- Primary Operation: Store ShelfData ---
    let shelf_data = ShelfData {
        metadata: ShelfMetadata {
            shelf_id: shelf_internal.shelf_id.clone(),
            title: shelf_internal.title.clone(),
            description: shelf_internal.description.clone(),
            owner: shelf_internal.owner,
            created_at: shelf_internal.created_at,
            updated_at: shelf_internal.updated_at, // Use the 'now' timestamp
            appears_in: shelf_internal.appears_in.clone(),
            tags: shelf_internal.tags.clone(),
            public_editing: shelf_internal.public_editing,
        },
        content: ShelfContent {
            items: shelf_internal.items.clone(),
            item_positions: shelf_internal.item_positions.clone(),
        },
    };

    SHELF_DATA.with(|sd_ref| sd_ref.borrow_mut().insert(shelf_id.clone(), shelf_data));
    ic_cdk::println!("Shelf {} created and stored in SHELF_DATA.", shelf_id);

    // --- Secondary Operation: Update GLOBAL_TIMELINE ---
    let timeline_value = GlobalTimelineItemValue {
        shelf_id: shelf_id.clone(),
        owner: shelf_internal.owner,
        tags: shelf_internal.tags.clone(),
        public_editing: shelf_internal.public_editing,
    };

    let timeline_update_result = GLOBAL_TIMELINE.with(|gt_ref| {
        // Simple error simulation: replace with actual error handling if insert can fail
        // For example, if the key must be unique and it's not, or storage capacity issues.
        // Here, we assume insert itself doesn't return a Result that indicates failure, 
        // so we'd rely on observing a panic or some other out-of-band error if it happens.
        // For robust logging, one might wrap the insert in a catch_unwind if panics are possible.
        // However, typical StableBTreeMap operations don't panic on logical errors like key collision (they overwrite).
        // Let's assume for this example a hypothetical scenario where it *could* fail silently or error out.

        // To make this example testable for logging, let's simulate a failure condition.
        // In a real scenario, this would be a genuine error from the insert operation if possible,
        // or a verification step that fails post-insert.
        if shelf_id.contains("FAIL_TIMELINE") { // Test condition for failure
            Err("Simulated failure updating GLOBAL_TIMELINE".to_string())
        } else {
            gt_ref.borrow_mut().insert(shelf_internal.updated_at, timeline_value.clone());
            Ok(())
        }
    });

    let mut task_id_on_error: Option<u64> = None;
    if let Err(e) = timeline_update_result {
        ic_cdk::println!(
            "Error updating GLOBAL_TIMELINE for shelf {}: {}. Logging task.",
            shelf_id, e
        );
        let task_type = ReconciliationTaskType::GlobalTimelineEntry {
            shelf_id: shelf_id.clone(),
            expected_timestamp: shelf_internal.updated_at, // or created_at, depending on timeline logic
            owner: shelf_internal.owner,
            tags: shelf_internal.tags.iter().map(|t| t.to_string()).collect(), // Convert NormalizedTag to String
            public_editing: shelf_internal.public_editing,
        };
        task_id_on_error = Some(add_reconciliation_task(task_type, e));
        // The main operation (shelf creation) succeeded, so we return Ok with the shelf_id
        // but also the task_id to indicate a follow-up action is needed.
        // The function signature changed to Result<(CommonShelfId, Option<u64>), String>
        return Ok((shelf_id, task_id_on_error)); 
    }

    // --- (Potentially) Secondary Operation: Update NFT_SHELVES if items contain NFTs ---
    // This part is more complex as it involves iterating items again.
    // For brevity, let's assume NFT updates are handled similarly: try, and if error, log task.
    // Example pseudo-code for NFT part:
    // for item_id in shelf_internal.items.keys() {
    //     if let Some(item_content) = &shelf_internal.items.get(item_id).map(|i| &i.content) {
    //         if let ItemContent::Nft(nft_id_str) = item_content {
    //             let nft_update_result = update_nft_shelves_for_add(&shelf_id, nft_id_str);
    //             if let Err(e_nft) = nft_update_result {
    //                 let nft_task_type = ReconciliationTaskType::NftShelfAdd { 
    //                     shelf_id: shelf_id.clone(), 
    //                     nft_id: nft_id_str.clone() 
    //                 };
    //                 add_reconciliation_task(nft_task_type, e_nft);
    //                 // Potentially collect multiple task_ids if granular errors are needed
    //                 // For now, the first error in timeline logs and returns.
    //             }
    //         }
    //     }
    // }
    
    ic_cdk::println!("GLOBAL_TIMELINE updated successfully for shelf {}.", shelf_id);
    Ok((shelf_id, None)) // Success, no reconciliation task ID
} 