use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use ic_cdk_macros::query;
use std::collections::BTreeMap;
use std::borrow::Cow; // Needed for manual conversion

use crate::storage::{
    Shelf, ShelfId, NormalizedTag, TagMetadata, 
    ShelfTagAssociationKey,
    UserProfileOrder, StringVec, TimestampedShelves, PrincipalSet, NormalizedTagSet,
    SHELVES, USER_SHELVES, NFT_SHELVES, USER_PROFILE_ORDER,
    TAG_METADATA, TAG_SHELF_ASSOCIATIONS, SHELF_TAG_ASSOCIATIONS, TAG_LEXICAL_INDEX,
    FOLLOWED_USERS, FOLLOWED_TAGS,
    ShelfSerializable, UserProfileOrderSerializable,
};
use crate::types::TagShelfAssociationKey;
use crate::ordering::PositionTracker; // Import PositionTracker if needed for conversion logic

// --- Helper function to convert Shelf to ShelfSerializable ---
// (Copied and adapted from Shelf's Storable impl)
fn convert_shelf_to_serializable(shelf: &Shelf) -> ShelfSerializable {
     // Use the new public constructor from storage.rs
     ShelfSerializable::from_shelf(shelf)
}

// --- Helper function to convert UserProfileOrder to UserProfileOrderSerializable ---
// (Copied and adapted from UserProfileOrder's Storable impl)
fn convert_uop_to_serializable(uop: &UserProfileOrder) -> UserProfileOrderSerializable {
    // Use the new public constructor from storage.rs
    UserProfileOrderSerializable::from_uop(uop)
}

// Generic Pagination Input
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BackupPaginationInput {
    pub limit: u64,
    pub offset: u64,
}

// --- Shelves Backup ---
// Use ShelfSerializable here
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelvesBackupChunk {
    pub data: Vec<(ShelfId, ShelfSerializable)>, // Changed Shelf to ShelfSerializable
    pub total_count: u64,
}

#[query]
fn backup_get_shelves(input: BackupPaginationInput) -> ShelvesBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = SHELVES.with(|map_ref| map_ref.borrow().len());

    SHELVES.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                // Convert Shelf to ShelfSerializable before pushing
                let serializable_shelf = convert_shelf_to_serializable(&value);
                data.push((key.clone(), serializable_shelf));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    ShelvesBackupChunk { data, total_count }
}

// --- User Shelves Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserShelvesBackupChunk {
    pub data: Vec<(Principal, TimestampedShelves)>,
    pub total_count: u64,
}

#[query]
fn backup_get_user_shelves(input: BackupPaginationInput) -> UserShelvesBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = USER_SHELVES.with(|map_ref| map_ref.borrow().len());

    USER_SHELVES.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push((key.clone(), value.clone()));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    UserShelvesBackupChunk { data, total_count }
}

// --- NFT Shelves Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct NftShelvesBackupChunk {
    // Key is NFT ID (String)
    pub data: Vec<(String, StringVec)>,
    pub total_count: u64,
}

#[query]
fn backup_get_nft_shelves(input: BackupPaginationInput) -> NftShelvesBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = NFT_SHELVES.with(|map_ref| map_ref.borrow().len());

    NFT_SHELVES.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push((key.clone(), value.clone()));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    NftShelvesBackupChunk { data, total_count }
}

// --- User Profile Order Backup ---
// Use UserProfileOrderSerializable here
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfileOrderBackupChunk {
    pub data: Vec<(Principal, UserProfileOrderSerializable)>, // Changed UserProfileOrder to UserProfileOrderSerializable
    pub total_count: u64,
}

#[query]
fn backup_get_user_profile_orders(input: BackupPaginationInput) -> UserProfileOrderBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = USER_PROFILE_ORDER.with(|map_ref| map_ref.borrow().len());

    USER_PROFILE_ORDER.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                 // Convert UserProfileOrder to UserProfileOrderSerializable before pushing
                 let serializable_uop = convert_uop_to_serializable(&value);
                 data.push((key.clone(), serializable_uop));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    UserProfileOrderBackupChunk { data, total_count }
}

// --- Tag Metadata Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TagMetadataBackupChunk {
    pub data: Vec<(NormalizedTag, TagMetadata)>,
    pub total_count: u64,
}

#[query]
fn backup_get_tag_metadata(input: BackupPaginationInput) -> TagMetadataBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = TAG_METADATA.with(|map_ref| map_ref.borrow().len());

    TAG_METADATA.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                // Decide here if you want to zero-out timestamps before returning
                // let mut meta = value.clone();
                // meta.first_seen_timestamp = 0;
                // meta.last_association_timestamp = 0;
                // meta.last_active_timestamp = 0;
                // data.push((key.clone(), meta));
                data.push((key.clone(), value.clone())); // Keep timestamps for now
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    TagMetadataBackupChunk { data, total_count }
}

// --- Tag Shelf Associations Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TagShelfAssociationsBackupChunk {
    // Key is TagShelfAssociationKey, Value is () - represented as Vec<Key>
    pub data: Vec<TagShelfAssociationKey>,
    pub total_count: u64,
}

#[query]
fn backup_get_tag_shelf_associations(input: BackupPaginationInput) -> TagShelfAssociationsBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = TAG_SHELF_ASSOCIATIONS.with(|map_ref| map_ref.borrow().len());

    TAG_SHELF_ASSOCIATIONS.with(|map_ref| {
        let map = map_ref.borrow();
        // Iterate keys only, as value is unit ()
        for (i, (key, _)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push(key.clone());
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    TagShelfAssociationsBackupChunk { data, total_count }
}

// --- Shelf Tag Associations Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelfTagAssociationsBackupChunk {
    // Key is ShelfTagAssociationKey, Value is () - represented as Vec<Key>
    pub data: Vec<ShelfTagAssociationKey>,
    pub total_count: u64,
}

#[query]
fn backup_get_shelf_tag_associations(input: BackupPaginationInput) -> ShelfTagAssociationsBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = SHELF_TAG_ASSOCIATIONS.with(|map_ref| map_ref.borrow().len());

    SHELF_TAG_ASSOCIATIONS.with(|map_ref| {
        let map = map_ref.borrow();
        // Iterate keys only, as value is unit ()
        for (i, (key, _)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push(key.clone());
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    ShelfTagAssociationsBackupChunk { data, total_count }
}

// --- Tag Lexical Index Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TagLexicalIndexBackupChunk {
    // Key is NormalizedTag, Value is () - represented as Vec<Key>
    pub data: Vec<NormalizedTag>,
    pub total_count: u64,
}

#[query]
fn backup_get_tag_lexical_index(input: BackupPaginationInput) -> TagLexicalIndexBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = TAG_LEXICAL_INDEX.with(|map_ref| map_ref.borrow().len());

    TAG_LEXICAL_INDEX.with(|map_ref| {
        let map = map_ref.borrow();
        // Iterate keys only, as value is unit ()
        for (i, (key, _)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push(key.clone());
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    TagLexicalIndexBackupChunk { data, total_count }
}

// --- Followed Users Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FollowedUsersBackupChunk {
    // Key is User Principal, Value is PrincipalSet
    pub data: Vec<(Principal, PrincipalSet)>,
    pub total_count: u64,
}

#[query]
fn backup_get_followed_users(input: BackupPaginationInput) -> FollowedUsersBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = FOLLOWED_USERS.with(|map_ref| map_ref.borrow().len());

    FOLLOWED_USERS.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push((key.clone(), value.clone()));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    FollowedUsersBackupChunk { data, total_count }
}

// --- Followed Tags Backup ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FollowedTagsBackupChunk {
    // Key is User Principal, Value is NormalizedTagSet
    pub data: Vec<(Principal, NormalizedTagSet)>,
    pub total_count: u64,
}

#[query]
fn backup_get_followed_tags(input: BackupPaginationInput) -> FollowedTagsBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = FOLLOWED_TAGS.with(|map_ref| map_ref.borrow().len());

    FOLLOWED_TAGS.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (key, value)) in map.iter().enumerate() {
            if i >= input.offset as usize && data.len() < input.limit as usize {
                data.push((key.clone(), value.clone()));
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    FollowedTagsBackupChunk { data, total_count }
}

