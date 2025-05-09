// // This approach is not feasible. Too many relationshipts to map and track that we can't back this up.




// // src/perpetua/src/update/restore.rs
// use candid::Principal;
// use ic_cdk_macros::update;
// use crate::ordering::PositionTracker;
// use crate::storage::{Shelf, ShelfBackupData, SHELVES, Item, SHELF_ITEM_STEP_SIZE, GLOBAL_TIMELINE};
// use crate::types::GlobalTimelineBackupChunk;
// use crate::ShelvesEssentialBackupChunk;

// // --- Define your controller principal(s) here ---
// const ADMIN_PRINCIPAL_STR: &str = "clchv-zocxh-7xzdu-ahmd6-homox-7qlh3-unom6-dl4no-zefil-jlyu5-jqe";

// #[update]
// pub async fn restore_essential_shelves(backup_chunk: ShelvesEssentialBackupChunk) -> Result<(), String> {
//     let caller = ic_cdk::caller();

//     // --- Authorization Check ---
//     let admin_principal = Principal::from_text(ADMIN_PRINCIPAL_STR)
//         .map_err(|e| format!("Failed to parse admin principal: {}", e))?;
//     if caller != admin_principal {
//         // You might want multiple controllers allowed in a real scenario
//             return Err("Unauthorized: Only the controller can restore data.".to_string());
//     }

//     ic_cdk::println!(
//         "Starting restore process from chunk. Expected total: {}, Actual items in chunk: {}", 
//         backup_chunk.total_count, 
//         backup_chunk.data.len()
//     );

//     // --- Clear Existing Shelf Data ---
//     SHELVES.with(|map_ref| {
//         let mut map = map_ref.borrow_mut();
//         // Note: StableBTreeMap doesn't have a direct `clear`. We need to remove keys.
//         // This can be slow for large maps. Consider alternatives if performance is critical.
//         let keys: Vec<_> = map.iter().map(|(k, _)| k.clone()).collect();
//         ic_cdk::println!("Clearing {} existing shelves...", keys.len());
//         for key in keys {
//             map.remove(&key);
//         }
//         ic_cdk::println!("Existing shelves cleared.");
//     });

//     // --- Restore Shelves from Backup ---
//     let mut restored_count = 0;
//     for backup_shelf in backup_chunk.data {
//         // Rebuild PositionTracker
//         let mut item_positions = PositionTracker::<u32>::new();
//         for (item_id, position) in backup_shelf.item_positions {
//             // Simple insert, assuming positions are valid.
//             // Error handling could be added here if positions might conflict.
//             item_positions.insert(item_id, position);
//         }

//         // Create the internal Shelf struct
//         let shelf = Shelf {
//             shelf_id: backup_shelf.shelf_id.clone(),
//             title: backup_shelf.title,
//             description: backup_shelf.description,
//             owner: backup_shelf.owner,
//             items: backup_shelf.items,
//             item_positions, // Use the rebuilt tracker
//             created_at: ic_cdk::api::time(), // Set new timestamp
//             updated_at: ic_cdk::api::time(), // Set new timestamp
//             appears_in: Vec::new(), // Reset appears_in
//             tags: backup_shelf.tags,
//             public_editing: backup_shelf.public_editing,
//         };

//         // Insert into the main map
//             SHELVES.with(|map_ref| {
//                 map_ref.borrow_mut().insert(shelf.shelf_id.clone(), shelf);
//             });
//             restored_count += 1;
//     }

//     ic_cdk::println!("Successfully restored {} shelves.", restored_count);
//     Ok(())
// }

// #[update]
// pub async fn restore_global_timeline(backup_chunk: GlobalTimelineBackupChunk) -> Result<(), String> {
//     let caller = ic_cdk::caller();

//     // --- Authorization Check ---
//     let admin_principal = Principal::from_text(ADMIN_PRINCIPAL_STR)
//         .map_err(|e| format!("Failed to parse admin principal: {}", e))?;
//     if caller != admin_principal {
//         return Err("Unauthorized: Only the controller can restore timeline data.".to_string());
//     }

//     ic_cdk::println!(
//         "Starting GLOBAL_TIMELINE restore. Chunk total_count: {}, Actual items in chunk: {}",
//         backup_chunk.total_count, 
//         backup_chunk.data.len()
//     );

//     // --- Clear Existing GLOBAL_TIMELINE Data ---
//     GLOBAL_TIMELINE.with(|map_ref| {
//         let mut map = map_ref.borrow_mut();
//         let keys: Vec<_> = map.iter().map(|(k, _)| k).collect(); // Corrected: k is already u64, no dereference needed
//         if !keys.is_empty() {
//             ic_cdk::println!("Clearing {} existing GLOBAL_TIMELINE entries...", keys.len());
//             for key in keys {
//                 map.remove(&key);
//             }
//             ic_cdk::println!("Existing GLOBAL_TIMELINE entries cleared.");
//         } else {
//             ic_cdk::println!("GLOBAL_TIMELINE is already empty. No entries to clear.");
//         }
//     });

//     // --- Restore GLOBAL_TIMELINE from Backup ---
//     let mut restored_count = 0;
//     for entry in backup_chunk.data {
//         GLOBAL_TIMELINE.with(|map_ref| {
//             map_ref.borrow_mut().insert(entry.timestamp, entry.shelf_id.clone());
//         });
//         restored_count += 1;
//     }

//     ic_cdk::println!("Successfully restored {} GLOBAL_TIMELINE entries.", restored_count);
//     Ok(())
// }