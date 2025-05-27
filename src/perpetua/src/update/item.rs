use candid::{CandidType, Deserialize};
use std::collections::HashSet;
use crate::storage::{Item, ItemContent, ShelfData, SHELF_DATA, NFT_SHELVES, ShelfId, StringVec};
use crate::storage::common_types::{MAX_NFT_ID_LENGTH, MAX_ITEMS_PER_SHELF, MAX_MARKDOWN_LENGTH, MAX_APPEARS_IN_COUNT, SHELF_ITEM_STEP_SIZE};
use crate::guard::not_anon;
use crate::update::utils::{verify_nft_ownership};
use crate::utils::id_conversion;

// --- Helper function for deep circular reference check ---
// Checks if adding 'shelf_to_evaluate_id' into 'target_parent_id' would create a cycle.
// It does this by seeing if 'target_parent_id' can be reached by traversing 'shelf_to_evaluate_id's children.
fn would_create_cycle(
    target_parent_id: &ShelfId,     // The shelf we are considering adding into (e.g., A)
    shelf_to_evaluate_id: &ShelfId, // The shelf being proposed to be added (e.g., B)
    visited_in_current_path: &mut HashSet<ShelfId>, // Tracks nodes visited in the current DFS path
) -> Result<bool, String> {
    // Base case 1: If the shelf we are evaluating (B or its children) is the same as the target parent (A),
    // then adding B to A would form a cycle (A -> B -> ... -> A).
    if shelf_to_evaluate_id == target_parent_id {
        return Ok(true);
    }

    // Base case 2: If we've already visited 'shelf_to_evaluate_id' in this specific DFS path,
    // it means we're in a loop that doesn't involve 'target_parent_id' directly from this path,
    // or we've already processed this node down this path. Stop here for this branch to prevent infinite recursion
    // during the check itself (e.g. if B -> D -> B already exists, and we are checking A -> B).
    if visited_in_current_path.contains(shelf_to_evaluate_id) {
        return Ok(false); 
    }
    
    visited_in_current_path.insert(shelf_to_evaluate_id.clone());

    let cycle_found_recursively = SHELF_DATA.with(|sds_map_ref| {
        let sds_map = sds_map_ref.borrow();
        // Fetch the data for the shelf we are currently evaluating.
        if let Some(shelf_to_evaluate_data) = sds_map.get(shelf_to_evaluate_id) {
            // Iterate over all items within the current shelf_to_evaluate.
            for item_in_evaluated_shelf in shelf_to_evaluate_data.content.items.values() {
                // If an item is a shelf, recursively check it.
                if let ItemContent::Shelf(ref sub_shelf_id) = item_in_evaluated_shelf.content {
                    // Pass along the original target_parent_id and the current sub_shelf_id
                    if would_create_cycle(target_parent_id, sub_shelf_id, visited_in_current_path)? {
                        return Ok(true); // Cycle detected through a sub-shelf.
                    }
                }
            }
            Ok(false) // No cycle found through this shelf's direct children leading to target_parent_id.
        } else {
            // If shelf_to_evaluate_id (or one of its children during recursion) doesn't exist,
            // it cannot complete a cycle involving target_parent_id through this path.
            // This could happen if a shelf ID exists in an item but the shelf itself was deleted.
            Ok(false)
        }
    });

    // Backtrack: remove from visited set as we return from this recursion path.
    visited_in_current_path.remove(shelf_to_evaluate_id);

    cycle_found_recursively
}

// --- Constants ---
const MAX_NFT_REFERENCES: usize = 500; // Limit for NFT_SHELVES tracking

/// Input structure for adding a new item to a shelf
#[derive(CandidType, Deserialize, Clone)]
pub struct AddItemInput {
    /// The content of the new item (NFT, Shelf, or other type)
    pub content: ItemContent,
    /// The reference item to position relative to (if None, will be placed at the end)
    pub reference_item_id: Option<u32>,
    /// Whether to place before (true) or after (false) the reference item
    pub before: bool,
}

/// Adds a single item to an existing shelf
/// 
/// Atomically updates parent shelf (content and metadata), 
/// nested shelf metadata (if adding a shelf), and NFT_SHELVES (if adding an NFT).
/// Panics on failure during the commit phase to ensure atomicity.
#[ic_cdk::update(guard = "not_anon")]
pub async fn add_item_to_shelf(shelf_id: String, input: AddItemInput) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    // --- Read & Validate Phase ---

    // 1. Fetch parent shelf data and check edit permissions
    let mut parent_shelf_data = SHELF_DATA.with(|sds| sds.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf '{}' not found", shelf_id))?;

    if parent_shelf_data.metadata.owner != caller && !parent_shelf_data.metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    // 2. Validate MAX_ITEMS_PER_SHELF (using parent_shelf_data.content)
    if parent_shelf_data.content.item_positions.len() >= MAX_ITEMS_PER_SHELF {
        return Err(format!("Maximum item limit reached ({}) for shelf {}", MAX_ITEMS_PER_SHELF, shelf_id));
    }

    // 3. Validate input.content and prepare related data for commit
    let mut prepared_nested_shelf_data_update: Option<(ShelfId, ShelfData)> = None;
    // This variable will store the intent to add a specific shelf_id to an NFT's list.
    let mut nft_shelf_addition_intent: Option<(String, ShelfId)> = None;

    match &input.content {
        ItemContent::Nft(ref nft_id_from_input) => {
            ic_cdk::println!("[add_item_to_shelf] Received ItemContent::Nft with nft_id_from_input: {}", nft_id_from_input);
            if nft_id_from_input.chars().any(|c| !c.is_digit(10)) {
                return Err("Invalid NFT ID: Contains non-digit characters.".to_string());
            }
            if nft_id_from_input.len() > MAX_NFT_ID_LENGTH { 
                return Err(format!("NFT ID exceeds maximum length of {} characters", MAX_NFT_ID_LENGTH));
            }
            let is_owner = verify_nft_ownership(nft_id_from_input, caller).await?;
            if !is_owner {
                return Err("Unauthorized: You can only add NFTs that you own".to_string());
            }
            
            let key_for_nft_shelves = id_conversion::get_original_nft_id_for_storage(nft_id_from_input);
            ic_cdk::println!("[add_item_to_shelf] Preparing NFT_SHELVES update for key: {}", key_for_nft_shelves);

            let decision = NFT_SHELVES.with(|map_ref| {
                let map = map_ref.borrow();
                if let Some(existing_shelves) = map.get(&key_for_nft_shelves) { // .get() clones from StableBTreeMap
                    if existing_shelves.0.contains(&shelf_id) {
                        Ok::<bool, String>(false) // Already present, no update needed
                    } else if existing_shelves.0.len() >= MAX_NFT_REFERENCES {
                        ic_cdk::println!("NFT {} reference limit ({}) reached. Not adding shelf {} to NFT_SHELVES.", key_for_nft_shelves, MAX_NFT_REFERENCES, shelf_id);
                        Ok::<bool, String>(false) // Limit reached
                    } else {
                        Ok::<bool, String>(true) // Needs to be added
                    }
                } else { // Key doesn't exist
                    if MAX_NFT_REFERENCES > 0 {
                        Ok::<bool, String>(true) // Needs to be added (new key)
                    } else {
                        ic_cdk::println!("NFT {} reference limit ({}) is zero. Not adding new shelf {} to NFT_SHELVES.", key_for_nft_shelves, MAX_NFT_REFERENCES, shelf_id);
                        Ok::<bool, String>(false) // Limit is zero, cannot add
                    }
                }
            })?;

            if decision {
                nft_shelf_addition_intent = Some((key_for_nft_shelves.clone(), shelf_id.clone()));
            }
        }
        ItemContent::Shelf(ref nested_shelf_id) => {
            // The direct self-reference (A cannot contain A) is implicitly handled by would_create_cycle
            // if shelf_id == nested_shelf_id { return Ok(true) } will be the first check.

            // Fetch the ShelfData for the nested_shelf_id. We need to clone it to potentially modify `appears_in`.
            let mut modified_nested_shelf_data = SHELF_DATA.with(|sds| 
                sds.borrow().get(nested_shelf_id).map(|data| data.clone())
            ).ok_or_else(|| format!("Shelf to be added ('{}') does not exist", nested_shelf_id))?;
            
            // Deep circular reference check:
            // Check if adding 'nested_shelf_id' into the current 'shelf_id' would create a cycle.
            let mut visited_for_cycle_check = HashSet::new();
            if would_create_cycle(&shelf_id, nested_shelf_id, &mut visited_for_cycle_check)? {
                return Err(format!(
                    "Adding shelf '{}' to shelf '{}' would create a circular reference.",
                    nested_shelf_id, shelf_id
                ));
            }

            // Prepare appears_in update for the (cloned and now potentially modified) nested shelf data.
            if !modified_nested_shelf_data.metadata.appears_in.contains(&shelf_id) {
                if modified_nested_shelf_data.metadata.appears_in.len() >= MAX_APPEARS_IN_COUNT {
                    modified_nested_shelf_data.metadata.appears_in.remove(0); // Remove the oldest
                }
                modified_nested_shelf_data.metadata.appears_in.push(shelf_id.clone());
                modified_nested_shelf_data.metadata.updated_at = now;
                prepared_nested_shelf_data_update = Some((nested_shelf_id.clone(), modified_nested_shelf_data));
            }
        }
        ItemContent::Markdown(markdown) => {
            if markdown.len() > MAX_MARKDOWN_LENGTH {
                 return Err(format!("Markdown content exceeds maximum length of {} characters", MAX_MARKDOWN_LENGTH));
            }
        }
    }

    // --- Prepare Phase (Parent Shelf) ---
    let new_item_id = parent_shelf_data.content.items.keys()
        .max()
        .map_or(1, |max_id| max_id + 1);

    let new_item = Item {
        id: new_item_id,
        content: input.content.clone(), // input.content is already validated
    };
    
    // Modify parent_shelf_data directly (it's a clone from the map get)
    parent_shelf_data.content.items.insert(new_item_id, new_item);
    let new_position = parent_shelf_data.content.item_positions.calculate_position(
        input.reference_item_id.as_ref(),
        input.before,
        SHELF_ITEM_STEP_SIZE
    )?;
    parent_shelf_data.content.item_positions.insert(new_item_id, new_position);
    parent_shelf_data.metadata.updated_at = now;

    // --- Commit Phase ---
    SHELF_DATA.with(|sds| {
        sds.borrow_mut().insert(shelf_id.clone(), parent_shelf_data);
    });

    if let Some((id, data)) = prepared_nested_shelf_data_update {
        SHELF_DATA.with(|sds| {
            sds.borrow_mut().insert(id, data);
        });
    }

    if let Some((key, shelf_to_add)) = nft_shelf_addition_intent {
        NFT_SHELVES.with(|map_ref| {
            let mut map = map_ref.borrow_mut();
            
            // Get the current list of shelves for the NFT, or a default (empty) if it's not present.
            let mut current_shelves = map.get(&key).unwrap_or_default(); // StringVec::default() is an empty Vec

            // Defensive checks, though prepare phase should have ideally caught these.
            if !current_shelves.0.contains(&shelf_to_add) {
                if current_shelves.0.len() < MAX_NFT_REFERENCES {
                    current_shelves.0.push(shelf_to_add.clone()); // Add the new shelf
                    map.insert(key.clone(), current_shelves); // Re-insert the modified list
                } else {
                    // This indicates a potential issue if prepare checks passed but limit is hit here.
                    ic_cdk::println!("[add_item_to_shelf] Commit: MAX_NFT_REFERENCES ({}) reached for key '{}' when trying to add shelf '{}'. This might indicate a state change between prepare and commit or a logic flaw.", MAX_NFT_REFERENCES, key, shelf_to_add);
                }
            } else {
                 // Optional: Log if it was already present, though prepare phase should have handled this.
                 // ic_cdk::println!("[add_item_to_shelf] Commit: Shelf '{}' already present for key '{}'. No update needed.", shelf_to_add, key);
            }
        });
    }

    Ok(())
}

/// Removes a item from an existing shelf
/// 
/// Only users with edit permissions can remove items.
/// This also handles cleanup of any references if the item contained an NFT or nested Shelf.
#[ic_cdk::update(guard = "not_anon")]
pub async fn remove_item_from_shelf(shelf_id: ShelfId, item_id: u32) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    // --- Read & Validate Phase ---
    let mut parent_shelf_data = SHELF_DATA.with(|sds| sds.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Parent shelf '{}' not found for removal", shelf_id))?;

    if parent_shelf_data.metadata.owner != caller && !parent_shelf_data.metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    let removed_item_content = parent_shelf_data.content.items.get(&item_id).map(|item| item.content.clone())
        .ok_or_else(|| format!("Item {} not found in shelf {}", item_id, shelf_id))?;

    // --- Prepare Phase ---
    // Modify parent_shelf_data directly
    let item_removed_from_map = parent_shelf_data.content.items.remove(&item_id).is_some();
    let item_removed_from_pos = parent_shelf_data.content.item_positions.remove(&item_id).is_some();

    if !item_removed_from_map && !item_removed_from_pos {
        return Err(format!("Item {} could not be fully removed from shelf content {}", item_id, shelf_id));
    } else if item_removed_from_map != item_removed_from_pos {
        ic_cdk::println!("WARN: Inconsistent internal state for item {} in shelf {}. Map removal: {}, Pos removal: {}. Proceeding with removal.", 
                         item_id, shelf_id, item_removed_from_map, item_removed_from_pos);
    }
    
    parent_shelf_data.metadata.updated_at = now;

    let mut prepared_nested_shelf_data_to_commit: Option<(ShelfId, ShelfData)> = None;
    let mut prepared_nft_shelves_update: Option<(String, Option<StringVec>)> = None; 

    match removed_item_content {
        ItemContent::Shelf(ref nested_shelf_id_removed) => {
            // Load the full ShelfData for the nested shelf to update its appears_in
            SHELF_DATA.with(|sds_map_ref| {
                if let Some(mut nested_shelf_data) = sds_map_ref.borrow().get(nested_shelf_id_removed).map(|sd| sd.clone()) {
                    let initial_len = nested_shelf_data.metadata.appears_in.len();
                    nested_shelf_data.metadata.appears_in.retain(|id| id != &shelf_id);
                    if nested_shelf_data.metadata.appears_in.len() != initial_len {
                        nested_shelf_data.metadata.updated_at = now;
                        prepared_nested_shelf_data_to_commit = Some((nested_shelf_id_removed.clone(), nested_shelf_data));
                    }
                }
            });
        }
        ItemContent::Nft(ref nft_id_on_shelf) => {
            let key_for_nft_shelves = id_conversion::get_original_nft_id_for_storage(nft_id_on_shelf);
            NFT_SHELVES.with(|nft_shelves_map_ref| {
                if let Some(mut shelves_for_nft) = nft_shelves_map_ref.borrow().get(&key_for_nft_shelves).map(|sv| sv.clone()) {
                    let initial_len = shelves_for_nft.0.len();
                    shelves_for_nft.0.retain(|id| id != &shelf_id);
                    if shelves_for_nft.0.is_empty() {
                        prepared_nft_shelves_update = Some((key_for_nft_shelves.clone(), None));
                    } else if shelves_for_nft.0.len() != initial_len {
                        prepared_nft_shelves_update = Some((key_for_nft_shelves.clone(), Some(shelves_for_nft)));
                    }
                }
            });
        }
        _ => {} 
    }

    // --- Commit Phase ---
    SHELF_DATA.with(|sds| {
        sds.borrow_mut().insert(shelf_id.clone(), parent_shelf_data);
    });

    if let Some((id, data)) = prepared_nested_shelf_data_to_commit {
        SHELF_DATA.with(|sds| {
            sds.borrow_mut().insert(id, data);
        });
    }

    if let Some((nft_id_key, string_vec_option)) = prepared_nft_shelves_update {
        NFT_SHELVES.with(|n_map| {
            let mut map = n_map.borrow_mut();
            match string_vec_option {
                Some(string_vec) => map.insert(nft_id_key, string_vec), 
                None => map.remove(&nft_id_key), 
            };
        });
    }
    
    Ok(())
}

/// Sets the absolute order of items within a shelf.
///
/// This replaces the existing item order with the one provided.
/// All item IDs in the input list must exist within the shelf.
/// This function is refactored for atomicity. It reads, validates, prepares the change,
/// then commits. Panics on commit failure.
#[ic_cdk::update(guard = "not_anon")]
pub fn set_item_order(shelf_id: ShelfId, ordered_item_ids: Vec<u32>) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = ic_cdk::api::time();

    // --- Read & Validate Phase ---
    let mut shelf_data = SHELF_DATA.with(|sds| sds.borrow().get(&shelf_id))
        .ok_or_else(|| format!("Shelf '{}' not found for set_item_order", shelf_id))?;

    if shelf_data.metadata.owner != caller && !shelf_data.metadata.public_editing {
        return Err("Unauthorized: You don't have edit permissions for this shelf".to_string());
    }
    
    // Validation: Check if all provided IDs exist in the shelf's *items* map
    let existing_item_ids_in_content: HashSet<u32> = shelf_data.content.items.keys().cloned().collect();
    let input_item_ids_set: HashSet<u32> = ordered_item_ids.iter().cloned().collect();

    if input_item_ids_set.len() != ordered_item_ids.len() {
        return Err("Duplicate item IDs provided in the order list.".to_string());
    }

    // Check for missing IDs from content (items in content but not in input list)
    let missing_ids_from_content: Vec<u32> = existing_item_ids_in_content.difference(&input_item_ids_set).cloned().collect();
    if !missing_ids_from_content.is_empty() {
        return Err(format!(
            "Input order is incomplete for shelf {}. Item IDs present in shelf content but missing from input list: {:?}",
            shelf_id, missing_ids_from_content
        ));
    }

    // Check for extra IDs in input list (items in input list but not in content)
    let extra_ids_in_input: Vec<u32> = input_item_ids_set.difference(&existing_item_ids_in_content).cloned().collect();
    if !extra_ids_in_input.is_empty() {
        return Err(format!(
            "Input order for shelf {} contains invalid item IDs not found in shelf content: {:?}",
            shelf_id, extra_ids_in_input
        ));
    }

    // --- Prepare Phase ---
    // Modify shelf_data directly
    shelf_data.content.item_positions.clear();
    for (index, item_id) in ordered_item_ids.iter().enumerate() {
        let position = (index as f64 + 1.0) * SHELF_ITEM_STEP_SIZE; 
        shelf_data.content.item_positions.insert(*item_id, position);
    }
    shelf_data.metadata.updated_at = now;
    
    // --- Commit Phase ---
    SHELF_DATA.with(|sds| {
        sds.borrow_mut().insert(shelf_id.clone(), shelf_data);
    });

    Ok(())
} 