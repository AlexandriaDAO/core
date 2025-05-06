use candid::{CandidType, Deserialize};
use std::cmp::Ordering;
use std::borrow::Cow;
use candid::{Encode, Decode};
use ic_stable_structures::{storable::Bound, Storable};

// Import necessary types (adjust path if needed)
use crate::storage::{NormalizedTag, ShelfId, ShelfBackupData};

// --- TagPopularityKey Definition ---

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
         match self.0.cmp(&other.0) {
             Ordering::Equal => self.1.cmp(&other.1),
             other => other,
         }
     }
}

// --- TagShelfAssociationKey Definition ---

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

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct GlobalTimelineEntry {
    pub timestamp: u64,
    pub shelf_id: ShelfId,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct GlobalTimelineBackupChunk {
    pub data: Vec<GlobalTimelineEntry>,
    pub total_count: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BackupPaginationInput {
    pub offset: u64,
    pub limit: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelvesEssentialBackupChunk {
    pub data: Vec<ShelfBackupData>,
    pub total_count: u64,
} 