use std::collections::BTreeMap;
use std::cmp::Ordering;

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
    where K: Clone + Ord;
    
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
    
    // calculate_position now contains the full logic, including rebalancing check
    fn calculate_position(&mut self, reference_key: Option<&K>, before: bool, step_size: f64) -> Result<f64, String>
    where K: Clone + Ord {
        // --- Start of logic moved from compute_position_value --- 
        match reference_key {
            Some(ref_key) => {
                let reference_pos = *self.get(ref_key)
                    .ok_or_else(|| "Reference item not found".to_string())?;

                if before {
                    let prev_pos_opt = self.values()
                        .filter(|&&pos| pos < reference_pos)
                        .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
                    
                    match prev_pos_opt {
                        Some(prev_pos) => {
                            let new_pos = (prev_pos + reference_pos) / 2.0;
                            // Check for precision loss
                            if new_pos == *prev_pos || new_pos == reference_pos {
                                // Rebalance and retry calculation
                                self.rebalance_positions(step_size);
                                // Must recalculate reference_pos and prev_pos after rebalance
                                let recalced_ref_pos = *self.get(ref_key).unwrap(); // Should exist
                                let recalced_prev_pos = self.values()
                                    .filter(|&&pos| pos < recalced_ref_pos)
                                    .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
                                match recalced_prev_pos {
                                    Some(p) => Ok((p + recalced_ref_pos) / 2.0),
                                    None => Ok(recalced_ref_pos - step_size) // Place before first item
                                }
                            } else {
                                Ok(new_pos) // No precision loss
                            }
                        },
                        None => Ok(reference_pos - step_size) // Place before first item
                    }
                } else { // Place after reference_key
                    let next_pos_opt = self.values()
                        .filter(|&&pos| pos > reference_pos)
                        .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
                    
                    match next_pos_opt {
                        Some(next_pos) => {
                            let new_pos = (reference_pos + next_pos) / 2.0;
                            // Check for precision loss
                            if new_pos == reference_pos || new_pos == *next_pos {
                                // Rebalance and retry calculation
                                self.rebalance_positions(step_size);
                                // Must recalculate reference_pos and next_pos after rebalance
                                let recalced_ref_pos = *self.get(ref_key).unwrap(); // Should exist
                                let recalced_next_pos = self.values()
                                    .filter(|&&pos| pos > recalced_ref_pos)
                                    .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
                                match recalced_next_pos {
                                    Some(n) => Ok((recalced_ref_pos + n) / 2.0),
                                    None => Ok(recalced_ref_pos + step_size) // Place after last item
                                }
                            } else {
                                Ok(new_pos) // No precision loss
                            }
                        },
                        None => Ok(reference_pos + step_size) // Place after last item
                    }
                }
            },
            None => { // No reference key - place at start or end
                if self.is_empty() {
                    return Ok(0.0); // First item
                }
                
                if before {
                    let min_pos = self.values().fold(f64::INFINITY, |a, &b| a.min(b));
                    Ok(min_pos - step_size)
                } else {
                    let max_pos = self.values().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
                    Ok(max_pos + step_size)
                }
            }
        }
        // --- End of logic moved from compute_position_value --- 
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