use std::collections::BTreeMap;
use std::cmp::Ordering;

/// The minimum floating-point gap allowed between adjacent positions before triggering a rebalance.
/// Set significantly larger than f64 epsilon (~2.2e-16) to prevent clustering.
const REBALANCE_MIN_GAP_THRESHOLD: f64 = 1e-9;

/// Trait defining the core ordering operations used across the application.
/// This abstraction works with different key types while sharing the same positioning logic.
pub trait PositionedOrdering<K> {
    /// Finds a position that would place an item before the target position
    fn find_position_before(&self, target_pos: f64, default_step: f64) -> f64;
    
    /// Finds a position that would place an item after the target position
    fn find_position_after(&self, target_pos: f64, default_step: f64) -> f64;
    
    /// Gets a map of all positions
    fn get_positions(&self) -> &BTreeMap<K, f64>;
    
    /// Gets a mutable reference to the positions map
    fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64>;
    
    /// Calculates a position based on reference item and placement preference.
    /// Takes &mut self because it might trigger an internal rebalance.
    /// Takes step_size to be used during rebalancing if needed.
    fn calculate_position(&mut self, reference_key: Option<&K>, before: bool, step_size: f64) -> Result<f64, String>
    where K: Clone + Ord + std::fmt::Debug;
    
    /// Rebalances all positions to be evenly spaced using the provided step_size
    fn rebalance_positions(&mut self, step_size: f64);
}

/// Implementation for any BTreeMap-based positioned ordering
impl<K: Ord + Clone> PositionedOrdering<K> for BTreeMap<K, f64> {
    fn find_position_before(&self, target_pos: f64, default_step: f64) -> f64 {
        let prev = self.values()
            .filter(|&&pos| pos < target_pos)
            .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
            
        match prev {
            Some(prev_pos) => (prev_pos + target_pos) / 2.0,
            None => target_pos - default_step // Use default_step
        }
    }

    fn find_position_after(&self, target_pos: f64, default_step: f64) -> f64 {
        let next = self.values()
            .filter(|&&pos| pos > target_pos)
            .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
            
        match next {
            Some(next_pos) => (target_pos + next_pos) / 2.0,
            None => target_pos + default_step // Use default_step
        }
    }
    
    fn get_positions(&self) -> &BTreeMap<K, f64> {
        self
    }
    
    fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64> {
        self
    }
    
    // calculate_position now contains the full logic, including proactive rebalancing check
    fn calculate_position(&mut self, reference_key: Option<&K>, before: bool, step_size: f64) -> Result<f64, String>
    where K: Clone + Ord + std::fmt::Debug { // Added Debug constraint for logging
        
        // Loop allows for one retry attempt after a rebalance.
        for attempt in 0..2 {
            match reference_key {
                Some(ref_key) => {
                    // --- Get current reference position ---
                    // Ensure reference key exists in the current state of the map
                    let reference_pos = *self.get(ref_key)
                        .ok_or_else(|| {
                            // If the key disappeared after a rebalance, it's an issue.
                            if attempt > 0 {
                                format!("Reference item (key: {:?}) lost after rebalance", ref_key) // TODO: Improve key display if possible
                            } else {
                                "Reference item not found".to_string()
                            }
                        })?;

                    // --- Determine immediate neighbours based on 'before' flag ---
                    // We find the positions immediately adjacent to the *target insertion spot*.
                    let (prev_pos_opt, next_pos_opt) = if before {
                        // Target spot is just *before* reference_pos.
                        // Neighbour before target spot: The item with the largest position < reference_pos.
                        // Neighbour after target spot: The reference item itself.
                        let prev = self.values()
                            .filter(|&&pos| pos < reference_pos)
                            .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal))
                            .cloned(); // Clone value in case we need mutable borrow later for rebalance
                        (prev, Some(reference_pos))
                    } else {
                        // Target spot is just *after* reference_pos.
                        // Neighbour before target spot: The reference item itself.
                        // Neighbour after target spot: The item with the smallest position > reference_pos.
                        let next = self.values()
                            .filter(|&&pos| pos > reference_pos)
                            .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal))
                            .cloned(); // Clone value
                        (Some(reference_pos), next)
                    };

                    // --- Calculate potential new position ---
                    let new_pos = match (prev_pos_opt, next_pos_opt) {
                        (Some(prev), Some(next)) => (prev + next) / 2.0, // Between two items
                        (None, Some(next)) => next - step_size,         // Before the first item (relative to ref)
                        (Some(prev), None) => prev + step_size,         // After the last item (relative to ref)
                        (None, None) => {
                            // This case implies the reference key is the *only* item in the map.
                            // Calculate position relative to the single reference item.
                            if before { reference_pos - step_size } else { reference_pos + step_size }
                        }
                    };

                    // --- Check if rebalance is needed ---
                    let mut needs_rebalance = false;
                    if let (Some(prev), Some(next)) = (prev_pos_opt, next_pos_opt) {
                        // Check only when inserting BETWEEN two existing positions.
                        let gap_before = new_pos - prev;
                        let gap_after = next - new_pos;

                        // Trigger rebalance if EITHER gap is too small OR if floating point precision loss occurred.
                        if gap_before < REBALANCE_MIN_GAP_THRESHOLD 
                           || gap_after < REBALANCE_MIN_GAP_THRESHOLD 
                           || new_pos == prev // Precision loss check
                           || new_pos == next // Precision loss check
                        {
                            needs_rebalance = true;
                        }
                    } 
                    // No gap check needed when adding at the absolute start/end relative to the reference key,
                    // but we still need the precision loss check in those cases.
                    else if let (None, Some(next)) = (prev_pos_opt, next_pos_opt) { // Before first relative to ref
                        if new_pos == next { needs_rebalance = true; }
                    } else if let (Some(prev), None) = (prev_pos_opt, next_pos_opt) { // After last relative to ref
                        if new_pos == prev { needs_rebalance = true; }
                    }
                    // Case (None, None) means only one item exists, no gaps/precision loss to check yet.

                    // --- Perform rebalance or return position ---
                    if needs_rebalance {
                        if attempt == 0 {
                            self.rebalance_positions(step_size);
                            continue; // Go to the next iteration to recalculate with new positions
                        } else {
                            // If rebalance was needed even on the second attempt, it indicates a potential issue.
                            // This could happen if step_size is too small for the number of items, causing
                            // rebalanced gaps to *still* be below the threshold.
                            // Use ic_cdk::println for logging on ICP.
                            ic_cdk::println!("WARN: Rebalance triggered twice for reference_key: {:?}, before: {}. Proceeding with potentially suboptimal position.", reference_key, before);
                            // Proceeding with the potentially suboptimal position calculated after the first rebalance attempt.
                            // A hard error might be too disruptive. Log and return the current `new_pos`.
                             return Ok(new_pos); 
                            // Alternative: return Err("Failed to find suitable position even after rebalancing... L".to_string());
                        }
                    } else {
                        // No rebalance needed, return the calculated position
                        return Ok(new_pos);
                    }
                }
                None => { // No reference key: Place at the absolute start or end of the list.
                    if self.is_empty() {
                        return Ok(0.0); // First item ever.
                    }
                    
                    // No gap checks needed here, as we are extending the range.
                    if before {
                        // Find the minimum position in the current state.
                        let min_pos = self.values().cloned().fold(f64::INFINITY, f64::min);
                        return Ok(min_pos - step_size);
                    } else {
                        // Find the maximum position in the current state.
                        let max_pos = self.values().cloned().fold(f64::NEG_INFINITY, f64::max);
                        return Ok(max_pos + step_size);
                    }
                }
            }
        } // End of loop

        // Should be unreachable if logic is correct, but needed for compiler.
        // This path is taken only if the loop completes without returning, 
        // which implies the rebalance -> continue path was taken on attempt 0, 
        // and then the code somehow exited the match without returning Ok or Err on attempt 1.
        Err("Internal error: Failed to calculate position after rebalance logic.".to_string())
    }
    
    fn rebalance_positions(&mut self, step_size: f64) {
        if self.is_empty() {
            return;
        }
        
        // Get ordered keys by collecting and copying data to avoid borrow issues
        let mut ordered_pairs: Vec<(K, f64)> = Vec::new();
        for (key, &value) in self.iter() {
            ordered_pairs.push((key.clone(), value));
        }
        
        // Sort the pairs by position value
        ordered_pairs.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(Ordering::Equal));
        
        // Reset positions to be evenly spaced
        // Start from step_size to avoid 0.0, making calculations near the start consistent
        let mut current_pos = step_size; 
        for (key, _) in ordered_pairs {
            self.insert(key, current_pos);
            current_pos += step_size;
        }
    }
}

// Helper functions that can be used by both Shelf and Profile ordering

/// Helper for getting ordered items based on their positions
pub fn get_ordered_by_position<K: Clone + Ord, V: Clone>(
    items: &BTreeMap<K, V>,
    positions: &BTreeMap<K, f64>
) -> Vec<V> {
    let mut ordered: Vec<_> = positions.iter().collect();
    ordered.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(Ordering::Equal));
    
    ordered.into_iter()
        .filter_map(|(key, _)| items.get(key).map(|item| item.clone()))
        .collect()
} 