use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use ic_cdk_macros::query;
use std::collections::BTreeMap;
use std::borrow::Cow; // Needed for manual conversion

use crate::storage::{
    ShelfId, NormalizedTag, // Keep basic types if needed elsewhere or by ShelfBackupData indirectly
    SHELVES,
    ShelfPublic, // Keep temporarily if ShelfBackupData needs it, but likely removable
    ShelfBackupData, // Import the new struct
    // Remove imports for deleted backup targets:
    // TagMetadata, ShelfTagAssociationKey, UserProfileOrder, StringVec,
    // TimestampedShelves, PrincipalSet, NormalizedTagSet, USER_SHELVES,
    // NFT_SHELVES, USER_PROFILE_ORDER, TAG_METADATA, TAG_SHELF_ASSOCIATIONS,
    // SHELF_TAG_ASSOCIATIONS, TAG_LEXICAL_INDEX, FOLLOWED_USERS, FOLLOWED_TAGS,
    // UserProfileOrderSerializable,
};
// Remove unused imports:
// use crate::types::TagShelfAssociationKey;
// use crate::ordering::PositionTracker;

// Generic Pagination Input
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BackupPaginationInput {
    pub limit: u64,
    pub offset: u64,
}

// --- NEW: Essential Shelves Backup Chunk ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShelvesEssentialBackupChunk {
    pub data: Vec<ShelfBackupData>, // Use the new simplified struct
    pub total_count: u64,
}

// --- NEW: Essential Shelves Backup Query ---
#[query]
fn backup_get_essential_shelves(input: BackupPaginationInput) -> ShelvesEssentialBackupChunk {
    let mut data = Vec::with_capacity(input.limit as usize);
    let total_count = SHELVES.with(|map_ref| map_ref.borrow().len());

    SHELVES.with(|map_ref| {
        let map = map_ref.borrow();
        for (i, (_key, value)) in map.iter().enumerate() { // Key is ShelfId, already in ShelfBackupData
            if i >= input.offset as usize && data.len() < input.limit as usize {
                // Convert internal Shelf to ShelfBackupData
                let backup_data = ShelfBackupData::from_internal(&value);
                data.push(backup_data);
            }
            if data.len() >= input.limit as usize {
                break;
            }
        }
    });

    ShelvesEssentialBackupChunk { data, total_count }
}


// --- REMOVE ALL OLD BACKUP FUNCTIONS AND STRUCTS ---

// --- Shelves Backup --- (REMOVE)
// ... removed ShelfPublic chunk struct ...
// ... removed backup_get_shelves function ...

// --- User Shelves Backup --- (REMOVE)
// ... removed UserShelvesBackupChunk struct ...
// ... removed backup_get_user_shelves function ...

// --- NFT Shelves Backup --- (REMOVE)
// ... removed NftShelvesBackupChunk struct ...
// ... removed backup_get_nft_shelves function ...

// --- User Profile Order Backup --- (REMOVE)
// ... removed UserProfileOrderBackupChunk struct ...
// ... removed backup_get_user_profile_orders function ...

// --- Tag Metadata Backup --- (REMOVE)
// ... removed TagMetadataBackupChunk struct ...
// ... removed backup_get_tag_metadata function ...

// --- Tag Shelf Associations Backup --- (REMOVE)
// ... removed TagShelfAssociationsBackupChunk struct ...
// ... removed backup_get_tag_shelf_associations function ...

// --- Shelf Tag Associations Backup --- (REMOVE)
// ... removed ShelfTagAssociationsBackupChunk struct ...
// ... removed backup_get_shelf_tag_associations function ...

// --- Tag Lexical Index Backup --- (REMOVE)
// ... removed TagLexicalIndexBackupChunk struct ...
// ... removed backup_get_tag_lexical_index function ...

// --- Followed Users Backup --- (REMOVE)
// ... removed FollowedUsersBackupChunk struct ...
// ... removed backup_get_followed_users function ...

// --- Followed Tags Backup --- (REMOVE)
// ... removed FollowedTagsBackupChunk struct ...
// ... removed backup_get_followed_tags function ...

// --- Ensure no dangling code references removed types ---
// (Check imports and function bodies above, should be clean now)

