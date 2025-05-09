// use candid::{CandidType, Deserialize};
// use ic_cdk_macros::query;

// use crate::storage::{
//     SHELVES,
//     ShelfBackupData, // Import the new struct
//     GLOBAL_TIMELINE,
//     // Remove imports for deleted backup targets:
//     // TagMetadata, ShelfTagAssociationKey, UserProfileOrder, StringVec,
//     // TimestampedShelves, NormalizedTag, TagPopularityKey, 
//     // OrphanedTagValue, PrincipalSet, NormalizedTagSet,
//     // NFT_SHELVES, USER_PROFILE_ORDER, TAG_METADATA, TAG_SHELF_ASSOCIATIONS,
//     // SHELF_TAG_ASSOCIATIONS, TAG_LEXICAL_INDEX, FOLLOWED_USERS, FOLLOWED_TAGS,
//     // UserProfileOrderSerializable,
// };
// use crate::types::{GlobalTimelineEntry, GlobalTimelineBackupChunk}; // These are in types.rs
// use crate::ShelvesEssentialBackupChunk; // Should now be resolved from lib.rs re-export
// use crate::BackupPaginationInput; // Should now be resolved from lib.rs re-export
// // Remove unused imports:
// // use crate::types::TagShelfAssociationKey;
// // use crate::ordering::PositionTracker;

// // Generic Pagination Input
// // If it's defined in types.rs, then this local definition is redundant.
// // Let's assume for now we use the one from types.rs and remove this local one.
// // #[derive(CandidType, Deserialize, Clone, Debug)]
// // pub struct BackupPaginationInput {
// //     pub limit: u64,
// //     pub offset: u64,
// // }

// // ShelvesEssentialBackupChunk is now imported from crate root, so its local definition is removed.

// // --- NEW: Essential Shelves Backup Query ---
// #[query]
// pub fn backup_get_essential_shelves(pagination: BackupPaginationInput) -> ShelvesEssentialBackupChunk {
//     let data = SHELVES.with(|shelves_ref| {
//         let shelves = shelves_ref.borrow();
//         shelves.iter()
//             .skip(pagination.offset as usize)
//             .take(pagination.limit as usize)
//             .map(|(_shelf_id, shelf)| ShelfBackupData::from_internal(&shelf))
//             .collect::<Vec<ShelfBackupData>>()
//     });
//     let total_count = SHELVES.with(|s| s.borrow().len());
//     ShelvesEssentialBackupChunk { data, total_count }
// }

// #[query]
// pub fn backup_get_global_timeline(pagination: BackupPaginationInput) -> GlobalTimelineBackupChunk {
//     ic_cdk::println!("[backup_get_global_timeline] Called with offset: {}, limit: {}", pagination.offset, pagination.limit);

//     let offset = pagination.offset as usize;
//     let limit = pagination.limit as usize;
//     let mut data = Vec::new();

//     GLOBAL_TIMELINE.with(|timeline_ref| {
//         let timeline = timeline_ref.borrow();
//         let total_count = timeline.len();
//         ic_cdk::println!("[backup_get_global_timeline] Total timeline entries: {}", total_count);

//         for (idx, (timestamp, shelf_id)) in timeline.iter().enumerate() {
//             if idx < offset {
//                 continue;
//             }
//             if data.len() >= limit {
//                 ic_cdk::println!("[backup_get_global_timeline] Reached limit ({}) at index {}. Breaking loop.", limit, idx);
//                 break;
//             }
//             // Log first few items being processed
//             if data.len() < 5 { // Log first 5 items added to data
//                 ic_cdk::println!("[backup_get_global_timeline] Processing item at index {}: ts={}, shelf_id={}", idx, timestamp, shelf_id);
//             }
//             data.push(GlobalTimelineEntry {
//                 timestamp: timestamp, 
//                 shelf_id: shelf_id.clone(),
//             });
//         }
//         ic_cdk::println!("[backup_get_global_timeline] Loop finished. data.len(): {}. Preparing to return.", data.len());
//         GlobalTimelineBackupChunk { data, total_count }
//     })
// }

// // --- REMOVE ALL OLD BACKUP FUNCTIONS AND STRUCTS ---

// // --- Shelves Backup --- (REMOVE)
// // ... removed ShelfPublic chunk struct ...
// // ... removed backup_get_shelves function ...

// // --- User Shelves Backup --- (REMOVE)
// // ... removed UserShelvesBackupChunk struct ...
// // ... removed backup_get_user_shelves function ...

// // --- NFT Shelves Backup --- (REMOVE)
// // ... removed NftShelvesBackupChunk struct ...
// // ... removed backup_get_nft_shelves function ...

// // --- User Profile Order Backup --- (REMOVE)
// // ... removed UserProfileOrderBackupChunk struct ...
// // ... removed backup_get_user_profile_orders function ...

// // --- Tag Metadata Backup --- (REMOVE)
// // ... removed TagMetadataBackupChunk struct ...
// // ... removed backup_get_tag_metadata function ...

// // --- Tag Shelf Associations Backup --- (REMOVE)
// // ... removed TagShelfAssociationsBackupChunk struct ...
// // ... removed backup_get_tag_shelf_associations function ...

// // --- Shelf Tag Associations Backup --- (REMOVE)
// // ... removed ShelfTagAssociationsBackupChunk struct ...
// // ... removed backup_get_shelf_tag_associations function ...

// // --- Tag Lexical Index Backup --- (REMOVE)
// // ... removed TagLexicalIndexBackupChunk struct ...
// // ... removed backup_get_tag_lexical_index function ...

// // --- Followed Users Backup --- (REMOVE)
// // ... removed FollowedUsersBackupChunk struct ...
// // ... removed backup_get_followed_users function ...

// // --- Followed Tags Backup --- (REMOVE)
// // ... removed FollowedTagsBackupChunk struct ...
// // ... removed backup_get_followed_tags function ...

// // --- Ensure no dangling code references removed types ---
// // (Check imports and function bodies above, should be clean now)

