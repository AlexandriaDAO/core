use ic_cdk;

use crate::storage::{USER_SHELVES, USER_PROFILE_ORDER, ShelfId};
use crate::guard::not_anon;

// Constants for profile shelf positioning
// const PROFILE_SHELF_THRESHOLDS: [(usize, f64); 2] = [
//     (100, 1e-8),
//     (0, 1e-6)
// ];

const PROFILE_SHELF_STEP_SIZE: f64 = 1000.0;

/// Reorders a shelf in a user's profile relative to another shelf
/// 
/// This repositions a shelf relative to other shelves on the user's profile.
/// The position can be specified as before or after another shelf.
#[ic_cdk::update(guard = "not_anon")]
pub fn reorder_profile_shelf(shelf_id: ShelfId, reference_shelf_id: Option<ShelfId>, before: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // First, verify that the shelf belongs to the caller
    USER_SHELVES.with(|user_shelves| {
        let user_shelves_map = user_shelves.borrow();
        
        if let Some(shelves_set) = user_shelves_map.get(&caller) {
            // Check if the target shelf exists in the user's set
            let shelf_exists = shelves_set.0.iter().any(|(_, id)| id == &shelf_id);
            if !shelf_exists {
                return Err("Shelf not found in your profile".to_string());
            }
            
            // If reference shelf is provided, verify it belongs to the user
            if let Some(ref_id) = &reference_shelf_id {
                let ref_exists = shelves_set.0.iter().any(|(_, id)| id == ref_id);
                if !ref_exists {
                    return Err("Reference shelf not found in your profile".to_string());
                }
            }
            
            Ok(())
        } else {
            Err("No shelves found for your profile".to_string())
        }
    })?;
    
    // Now handle the actual reordering using PositionTracker
    USER_PROFILE_ORDER.with(|profile_order| {
        let mut profile_map = profile_order.borrow_mut();
        let mut user_order = profile_map.get(&caller)
            .map(|o| o.clone())
            .unwrap_or_default();
        
        // Mark the profile as customized
        user_order.is_customized = true;
        
        // Ensure the shelf being moved exists in the tracker (it might not if it was just added)
        // If it doesn't exist, calculate an initial position (e.g., at the end) before moving
        // This handles the case where a shelf is added but not yet explicitly ordered.
        if !user_order.shelf_positions.contains_key(&shelf_id) {
             // Calculate position at the end
             let initial_pos = user_order.shelf_positions.calculate_position(None, false, PROFILE_SHELF_STEP_SIZE)?;
             user_order.shelf_positions.insert(shelf_id.clone(), initial_pos);
        }

        // Ensure reference shelf exists in tracker if provided.
        // This is crucial because calculate_position needs it.
        if let Some(ref_id) = &reference_shelf_id {
            if !user_order.shelf_positions.contains_key(ref_id) {
                 // If the reference shelf doesn't have a position yet, assign one at the end.
                 // This handles cases where the reference shelf itself hasn't been ordered before.
                 let temp_pos = user_order.shelf_positions.calculate_position(None, false, PROFILE_SHELF_STEP_SIZE)?;
                 user_order.shelf_positions.insert(ref_id.clone(), temp_pos);
                 ic_cdk::println!("WARN: Reference shelf '{}' was not in profile order tracker. Assigned default position.", ref_id);
            }
        }
        
        // Calculate the new position using PositionTracker method
        let new_position = user_order.shelf_positions.calculate_position(
            reference_shelf_id.as_ref(), // Pass Option<&ShelfId>
            before, 
            PROFILE_SHELF_STEP_SIZE
        )?;
        
        // Update the shelf position in the tracker (insert handles update)
        user_order.shelf_positions.insert(shelf_id, new_position);
        
        // Save changes back to the stable map
        profile_map.insert(caller, user_order);
        
        Ok(())
    })
}

/// Resets the profile order to default (chronological ordering)
/// 
/// This clears all customizations and returns the profile to its original state.
#[ic_cdk::update(guard = "not_anon")]
pub fn reset_profile_order() -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    USER_PROFILE_ORDER.with(|profile_order| {
        let mut profile_map = profile_order.borrow_mut();
        
        // Get the existing order or a default one
        let mut order = profile_map.get(&caller)
            .map(|o| o.clone())
            .unwrap_or_default();

        // Clear positions using PositionTracker method
        order.shelf_positions.clear(); 
        order.is_customized = false;
        
        // Save the cleared/reset order
        profile_map.insert(caller, order);
        
        Ok(())
    })
} 