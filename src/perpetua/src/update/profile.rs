use ic_cdk;

use crate::storage::{USER_SHELVES, USER_PROFILE_ORDER};
use crate::ordering::{PositionedOrdering};
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
pub fn reorder_profile_shelf(shelf_id: String, reference_shelf_id: Option<String>, before: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let shelf_id_ref = &shelf_id;
    
    // First, verify that the shelf belongs to the caller
    USER_SHELVES.with(|user_shelves| {
        let user_shelves_map = user_shelves.borrow();
        
        if let Some(shelves_set) = user_shelves_map.get(&caller) {
            // Check if the shelf exists in the user's set
            let shelf_exists = shelves_set.0.iter().any(|(_, id)| id == shelf_id_ref);
            
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
    
    // Now handle the actual reordering
    USER_PROFILE_ORDER.with(|profile_order| {
        let mut profile_map = profile_order.borrow_mut();
        let mut user_order = profile_map.get(&caller)
            .map(|order| order.clone())
            .unwrap_or_default();
        
        // Mark the profile as customized
        user_order.is_customized = true;
        
        // Calculate new position using the shared abstraction
        let ref_shelf_id_ref = reference_shelf_id.as_ref();
        
        // Make sure the reference shelf has a position if it exists
        if let Some(ref_id) = ref_shelf_id_ref {
            if !user_order.shelf_positions.contains_key(ref_id) {
                // If reference shelf doesn't have a position yet, assign one
                let max_pos = user_order.shelf_positions.values()
                    .fold(0.0, |max, &pos| if pos > max { pos } else { max });
                user_order.shelf_positions.insert(ref_id.clone(), max_pos + PROFILE_SHELF_STEP_SIZE);
            }
        }
        
        // Calculate the new position - pass mutable borrow
        let new_position = user_order.shelf_positions.calculate_position(
            ref_shelf_id_ref, 
            before, 
            PROFILE_SHELF_STEP_SIZE
        )?;
        
        // Update the shelf position
        user_order.shelf_positions.insert(shelf_id, new_position);
        
        // Save changes
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
        
        // Remove the user's profile order or reset it
        if let Some(mut order) = profile_map.get(&caller).map(|order| order.clone()) {
            order.shelf_positions.clear();
            order.is_customized = false;
            profile_map.insert(caller, order);
        } else {
            // If entry doesn't exist yet, nothing to do
        }
        
        Ok(())
    })
} 