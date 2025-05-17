use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cmp::Ordering;
use std::cell::RefCell; // Required for MAP.with, etc.

// Imports from parent storage module
use super::{MEMORY_MANAGER, Memory, MemoryId};

// Import common types from sibling module
use super::common_types::{ShelfId, NormalizedTag};

// Imports from main types module in the crate
use crate::types::{TagPopularityKey, TagShelfAssociationKey as CrateTagShelfAssociationKey}; // Renaming to avoid conflict

// --- Define TagMetadata ---
#[derive(CandidType, Deserialize, Clone, Debug, Default)]
pub struct TagMetadata {
    pub current_shelf_count: u64,
    pub first_seen_timestamp: u64,
    pub last_association_timestamp: u64,
    pub last_active_timestamp: u64,
}

impl Storable for TagMetadata {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded;
}

// --- Define ShelfTagAssociationKey (distinct from crate::types::TagShelfAssociationKey) ---
// This key is (ShelfId, NormalizedTag) used for SHELF_TAG_ASSOCIATIONS map.
// crate::types::TagShelfAssociationKey is (NormalizedTag, ShelfId) for TAG_SHELF_ASSOCIATIONS map.
#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct ShelfTagAssociationKey {
    pub shelf_id: ShelfId, 
    pub tag: NormalizedTag,
}

impl Storable for ShelfTagAssociationKey {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(&self.shelf_id, &self.tag).unwrap()) } // Ensure order matches struct
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let (shelf_id, tag) = Decode!(bytes.as_ref(), ShelfId, NormalizedTag).unwrap();
        Self { shelf_id, tag }
    }
    const BOUND: Bound = Bound::Unbounded;
}
impl PartialOrd for ShelfTagAssociationKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}
impl Ord for ShelfTagAssociationKey {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.shelf_id.cmp(&other.shelf_id) { // Compare shelf_id first
            Ordering::Equal => self.tag.cmp(&other.tag),
            other_cmp => other_cmp,
        }
    }
}

// --- Tag Shelf Creation Timeline Index Key ---
#[derive(CandidType, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct TagShelfCreationTimelineKey {
    pub tag: NormalizedTag,
    pub reversed_created_at: u64,
    pub shelf_id: ShelfId,
}

impl Storable for TagShelfCreationTimelineKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.tag, &self.reversed_created_at, &self.shelf_id).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let (tag, reversed_created_at, shelf_id) =
            Decode!(bytes.as_ref(), NormalizedTag, u64, ShelfId).unwrap();
        Self { tag, reversed_created_at, shelf_id }
    }
    const BOUND: Bound = Bound::Unbounded;
}
impl PartialOrd for TagShelfCreationTimelineKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}
impl Ord for TagShelfCreationTimelineKey {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.tag.cmp(&other.tag) {
            Ordering::Equal => match self.reversed_created_at.cmp(&other.reversed_created_at) {
                Ordering::Equal => self.shelf_id.cmp(&other.shelf_id),
                other_ts => other_ts,
            },
            other_tag => other_tag,
        }
    }
}

// --- Constants ---
pub const MAX_TAG_LENGTH: usize = 25;

// Memory IDs
pub(crate) const TAG_METADATA_MEM_ID: MemoryId = MemoryId::new(10);
pub(crate) const TAG_SHELF_ASSOCIATIONS_MEM_ID: MemoryId = MemoryId::new(11); // Uses crate::types::TagShelfAssociationKey
pub(crate) const SHELF_TAG_ASSOCIATIONS_MEM_ID: MemoryId = MemoryId::new(12); // Uses local ShelfTagAssociationKey
pub(crate) const TAG_POPULARITY_INDEX_MEM_ID: MemoryId = MemoryId::new(13); // Uses crate::types::TagPopularityKey
pub(crate) const TAG_LEXICAL_INDEX_MEM_ID: MemoryId = MemoryId::new(14);
pub(crate) const TAG_SHELF_CREATION_TIMELINE_INDEX_MEM_ID: MemoryId = MemoryId::new(19);

thread_local! {
    pub static TAG_METADATA: RefCell<StableBTreeMap<NormalizedTag, TagMetadata, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TAG_METADATA_MEM_ID)))
    );
    // Uses TagShelfAssociationKey from crate::types (NormalizedTag, ShelfId)
    pub static TAG_SHELF_ASSOCIATIONS: RefCell<StableBTreeMap<CrateTagShelfAssociationKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TAG_SHELF_ASSOCIATIONS_MEM_ID)))
    );
    // Uses local ShelfTagAssociationKey (ShelfId, NormalizedTag)
    pub static SHELF_TAG_ASSOCIATIONS: RefCell<StableBTreeMap<ShelfTagAssociationKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(SHELF_TAG_ASSOCIATIONS_MEM_ID)))
    );
    // Uses TagPopularityKey from crate::types (u64, NormalizedTag)
    pub static TAG_POPULARITY_INDEX: RefCell<StableBTreeMap<TagPopularityKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TAG_POPULARITY_INDEX_MEM_ID)))
    );
    pub static TAG_LEXICAL_INDEX: RefCell<StableBTreeMap<NormalizedTag, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TAG_LEXICAL_INDEX_MEM_ID)))
    );
    pub static TAG_SHELF_CREATION_TIMELINE_INDEX: RefCell<StableBTreeMap<TagShelfCreationTimelineKey, (), Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(TAG_SHELF_CREATION_TIMELINE_INDEX_MEM_ID)))
    );
}

// --- Tag validation function ---
pub fn validate_tag_format(tag: &NormalizedTag) -> Result<(), String> {
    if tag.len() > MAX_TAG_LENGTH {
        return Err(format!("Tag exceeds maximum length of {}", MAX_TAG_LENGTH));
    }
    if !tag.chars().all(|c| c.is_alphanumeric()) {
        return Err("Tags can only contain letters (a-z, A-Z) and numbers (0-9)".to_string());
    }
    if tag.is_empty() {
         return Err("Tag cannot be empty".to_string());
    }
    Ok(())
} 