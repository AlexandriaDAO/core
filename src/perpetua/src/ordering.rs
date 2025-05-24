use std::collections::BTreeMap;
use std::cmp::Ordering;
use std::borrow::Borrow; // Needed for BTreeMap key flexibility

/// The minimum floating-point gap allowed between adjacent positions before triggering a rebalance.
/// Set significantly larger than f64 epsilon (~2.2e-16) to prevent clustering.
const REBALANCE_MIN_GAP_THRESHOLD: f64 = 1e-9;

// --- OrderedFloat Wrapper ---
// Wrapper to allow f64 to be used as a BTreeMap key.
// NOTE: Assumes NaNs will not be inserted. Behavior with NaN is undefined by Ord.
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct OrderedFloat(pub f64);

impl Eq for OrderedFloat {}

impl Ord for OrderedFloat {
    fn cmp(&self, other: &Self) -> Ordering {
        self.0.partial_cmp(&other.0).unwrap_or_else(|| {
            // Handle NaN comparison if it ever occurs, though it shouldn't with our logic.
            // Decide on a consistent ordering for NaNs, e.g., treat them as less than everything.
             if self.0.is_nan() && other.0.is_nan() {
                 Ordering::Equal
             } else if self.0.is_nan() {
                 Ordering::Less // Or Greater, be consistent
             } else if other.0.is_nan() {
                 Ordering::Greater // Or Less, be consistent
             } else {
                 // Should not happen if partial_cmp only fails for NaN
                 Ordering::Equal 
             }
         })
    }
}


// --- PositionTracker ---
// Manages positions using two maps for efficient key and position lookups.
#[derive(Debug, Clone)]
pub struct PositionTracker<K: Ord + Clone> {
    positions_by_key: BTreeMap<K, f64>,
    keys_by_position: BTreeMap<OrderedFloat, Vec<K>>,
    // Note: Using BTreeMap<OrderedFloat, K> assumes positions are unique. 
    // If exact position collisions are possible and need to be handled (e.g., multiple items at 0.0), 
    // value should be BTreeSet<K>. For our midpoint logic, collisions should be extremely rare except transiently during rebalance.
    // Let's stick with K for now and refine if needed.
}

// Default implementation needed for Candid derivation later if used directly in structs
impl<K: Ord + Clone + std::fmt::Debug> Default for PositionTracker<K> {
    fn default() -> Self {
        Self::new()
    }
}


impl<K: Ord + Clone + std::fmt::Debug> PositionTracker<K> {
    pub fn new() -> Self {
        Self {
            positions_by_key: BTreeMap::new(),
            keys_by_position: BTreeMap::new(),
        }
    }

    pub fn len(&self) -> usize {
        self.positions_by_key.len()
    }

    pub fn is_empty(&self) -> bool {
        self.positions_by_key.is_empty()
    }

    pub fn get_position<Q: ?Sized>(&self, key: &Q) -> Option<f64>
    where
        K: Borrow<Q>,
        Q: Ord + Eq,
    {
        self.positions_by_key.get(key).cloned()
    }

    pub fn contains_key<Q: ?Sized>(&self, key: &Q) -> bool
    where
        K: Borrow<Q>,
        Q: Ord + Eq,
    {
        self.positions_by_key.contains_key(key)
    }

    pub fn get_ordered_keys(&self) -> Vec<K> {
        self.keys_by_position.values().flat_map(|keys_vec| keys_vec.iter().cloned()).collect()
    }

    /// Returns the keys and their positions, ordered by position.
    pub fn get_ordered_entries(&self) -> Vec<(K, f64)> {
        self.keys_by_position.iter()
            .flat_map(|(pos_ord, keys_vec)| {
                keys_vec.iter().map(move |key| (key.clone(), pos_ord.0))
            })
            .collect()
    }

    // --- Core Mutation Methods ---

    /// Inserts or updates the position for a key, maintaining both maps.
    pub fn insert(&mut self, key_to_insert: K, new_position: f64) {
        // Remove key_to_insert from its old position in keys_by_position if its position changes.
        if let Some(old_position_float) = self.positions_by_key.insert(key_to_insert.clone(), new_position) {
            if old_position_float != new_position { // Position actually changed.
                let old_ord_float = OrderedFloat(old_position_float);
                if let Some(keys_at_old_pos) = self.keys_by_position.get_mut(&old_ord_float) {
                    keys_at_old_pos.retain(|k| k != &key_to_insert); // K needs PartialEq, which Ord implies.
                    if keys_at_old_pos.is_empty() {
                        self.keys_by_position.remove(&old_ord_float);
                    }
                }
            }
        }
        
        // Add key_to_insert to the Vec at new_position in keys_by_position.
        self.keys_by_position
            .entry(OrderedFloat(new_position))
            .or_insert_with(Vec::new)
            .push(key_to_insert);
    }

    /// Removes a key and its position from both maps. Returns the position if the key existed.
    pub fn remove<Q: ?Sized>(&mut self, key_to_remove: &Q) -> Option<f64>
    where
        K: Borrow<Q> + Clone, 
        Q: Ord + Eq, // Removed Debug constraint as it's not used in this function body for Q
    {
        // Remove from positions_by_key first to get the position
        if let Some(removed_position_float) = self.positions_by_key.remove(key_to_remove) {
            let ord_float = OrderedFloat(removed_position_float);
            if let Some(keys_at_pos) = self.keys_by_position.get_mut(&ord_float) {
                // K: Borrow<Q> allows us to compare &K with &Q
                keys_at_pos.retain(|k_in_vec| k_in_vec.borrow() != key_to_remove);
                if keys_at_pos.is_empty() {
                    self.keys_by_position.remove(&ord_float);
                }
            }
            Some(removed_position_float)
        } else {
            None
        }
    }

    /// Clears all positions.
    pub fn clear(&mut self) {
        self.positions_by_key.clear();
        self.keys_by_position.clear();
    }

    /// Finds the positions immediately before and after the target position. O(log N).
    fn find_neighbors(&self, target_pos: f64) -> (Option<f64>, Option<f64>) {
        let target_ord = OrderedFloat(target_pos);

        // Find the largest position strictly less than target_pos
        let prev = self.keys_by_position
            .range(..target_ord) // Range of positions less than target
            .next_back()          // Get the last (largest) one in that range
            .map(|(pos, _key)| pos.0); // Extract the f64 position

        // Find the smallest position strictly greater than target_pos
        // Use range with Excluded bound for correctness if target_pos itself exists in the map
        let next = self.keys_by_position
            .range((std::ops::Bound::Excluded(target_ord), std::ops::Bound::Unbounded))
            .next() // Get the first item in the range > target_pos
            .map(|(pos, _key)| pos.0); // Extract the f64 position

        (prev, next)
    }

    /// Calculates a position based on reference item and placement preference. O(log N).
    /// Takes &mut self because it might trigger an internal rebalance.
    pub fn calculate_position(
        &mut self, 
        reference_key: Option<&K>, 
        before: bool, 
        step_size: f64
    ) -> Result<f64, String> {
        // Loop allows for one retry attempt after a rebalance.
        for attempt in 0..2 {
            // --- Determine Neighbors of the Target Insertion Spot ---
            // These are the positions immediately bounding where the new item *should* go.
            let (neighbor_before_spot, neighbor_after_spot) = match reference_key {
                 Some(ref_key) => {
                     // --- Get current reference position --- O(log N)
                     let reference_pos = self.get_position(ref_key)
                         .ok_or_else(|| {
                             if attempt > 0 {
                                 format!("Reference item (key: {:?}) lost after rebalance", ref_key)
                             } else {
                                 "Reference item not found".to_string()
                             }
                         })?;

                     // Find neighbors relative to the reference position itself. O(log N)
                     let (prev_neighbor, next_neighbor) = self.find_neighbors(reference_pos);

                     if before {
                         // Target spot is just *before* reference_pos.
                         // Neighbor before target spot: prev_neighbor (largest pos < reference_pos)
                         // Neighbor after target spot: reference_pos itself.
                         (prev_neighbor, Some(reference_pos))
                     } else {
                         // Target spot is just *after* reference_pos.
                         // Neighbor before target spot: reference_pos itself.
                         // Neighbor after target spot: next_neighbor (smallest pos > reference_pos)
                         (Some(reference_pos), next_neighbor)
                     }
                 }
                 None => { // No reference key: Place at the absolute start or end.
                     if self.is_empty() {
                         return Ok(0.0); // First item ever.
                     }
                     // Find absolute min/max using the ordered map - O(log N)
                     let min_pos_opt = self.keys_by_position.first_key_value().map(|(p, _)| p.0);
                     let max_pos_opt = self.keys_by_position.last_key_value().map(|(p, _)| p.0);

                     if before {
                         // Target spot is before the first item.
                         // Neighbor before: None
                         // Neighbor after: Minimum existing position
                         (None, min_pos_opt) 
                     } else {
                          // Target spot is after the last item.
                         // Neighbor before: Maximum existing position
                         // Neighbor after: None
                         (max_pos_opt, None) 
                     }
                 }
            };
            
            // --- Calculate potential new position ---
            let new_pos = match (neighbor_before_spot, neighbor_after_spot) {
                (Some(prev), Some(next)) => (prev + next) / 2.0, // Between two items
                (None, Some(next)) => next - step_size,         // Before the first item
                (Some(prev), None) => prev + step_size,         // After the last item
                (None, None) => {
                     // This case should only happen if the map was empty and we are adding the first item without a reference key.
                     // It's handled by the early return `if self.is_empty()`.
                     return Err("Internal error: Unreachable state in position calculation (None, None)".to_string());
                }
            };

            // --- Check if rebalance is needed ---
            let mut needs_rebalance = false;
            // Check only needed when inserting BETWEEN two existing positions.
            if let (Some(prev), Some(next)) = (neighbor_before_spot, neighbor_after_spot) {
                 let gap_before = new_pos - prev;
                 let gap_after = next - new_pos;
                // Trigger rebalance if EITHER gap is too small OR if precision loss occurred.
                if gap_before < REBALANCE_MIN_GAP_THRESHOLD 
                   || gap_after < REBALANCE_MIN_GAP_THRESHOLD 
                   || new_pos <= prev // Precision loss check (use <= just in case)
                   || new_pos >= next // Precision loss check (use >= just in case)
                {
                    needs_rebalance = true;
                }
            } 
            // No gap check needed when adding at the absolute start/end,
            // but we still need the precision loss check against the single neighbor.
            else if let (None, Some(next)) = (neighbor_before_spot, neighbor_after_spot) { // Before first
                if new_pos >= next { needs_rebalance = true; }
            } else if let (Some(prev), None) = (neighbor_before_spot, neighbor_after_spot) { // After last
                if new_pos <= prev { needs_rebalance = true; }
            }
             // Case (None, None) is unreachable.

            // --- Perform rebalance or return position ---
            if needs_rebalance {
                if attempt == 0 {
                    self.rebalance_positions(step_size);
                    continue; // Go to the next iteration to recalculate with new positions
                } else {
                    // Rebalance needed even on the second attempt. Log and return potentially suboptimal position.
                    ic_cdk::println!("WARN: Rebalance triggered twice for reference_key: {:?}, before: {}. Proceeding with potentially suboptimal position.", reference_key, before);
                    // Return the position calculated *after* the first rebalance (which is `new_pos` from this iteration)
                    return Ok(new_pos); 
                    // Alternative: return Err("Failed to find suitable position even after rebalancing.".to_string());
                }
            } else {
                // No rebalance needed, return the calculated position
                return Ok(new_pos);
            }
        } // End of loop

         // Should be unreachable if logic is correct.
         Err("Internal error: Failed to calculate position after rebalance logic.".to_string())
    }

    /// Rebalances all positions to be evenly spaced using the provided step_size. O(N log N).
    pub fn rebalance_positions(&mut self, step_size: f64) {
        if self.is_empty() {
            return;
        }

        // Get currently ordered keys (ordered by position)
        let ordered_keys: Vec<K> = self.keys_by_position
            .values()
            .flat_map(|vec_k| vec_k.iter().cloned())
            .collect();

        // We need to rebuild both maps. Clear them first.
        self.positions_by_key.clear();
        self.keys_by_position.clear(); 

        // Reset positions to be evenly spaced
        let mut current_pos = step_size; // Start from step_size
        for key in ordered_keys {
            // Insert updates both maps correctly
            self.insert(key, current_pos); 
            current_pos += step_size;
        }
    }
    
    /// Returns an iterator over keys ordered by their position.
    pub fn iter_keys_ordered(&self) -> impl Iterator<Item = &K> {
        self.keys_by_position.values().flat_map(|keys_vec| keys_vec.iter())
    }

    /// Returns an iterator over (key, position) ordered by position.
    pub fn iter_ordered(&self) -> impl Iterator<Item = (&K, f64)> {
        self.keys_by_position.iter().flat_map(|(pos_ord, keys_vec)| {
            keys_vec.iter().map(move |key| (key, pos_ord.0))
        })
    }
}


// --- Remove old PositionedOrdering trait, BTreeMap implementation, and get_ordered_by_position helper ---

// pub trait PositionedOrdering<K> { ... }
// impl<K: Ord + Clone> PositionedOrdering<K> for BTreeMap<K, f64> { ... }
// pub fn get_ordered_by_position<K: Clone + Ord, V: Clone>(...) -> Vec<V> { ... }

// Keep the threshold constant defined at the top.
// Keep the OrderedFloat struct defined at the top.

// pub trait PositionedOrdering<K> {
//     /// Finds a position that would place an item before the target position
//     fn find_position_before(&self, target_pos: f64, default_step: f64) -> f64;
//     
//     /// Finds a position that would place an item after the target position
//     fn find_position_after(&self, target_pos: f64, default_step: f64) -> f64;
//     
//     /// Gets a map of all positions
//     fn get_positions(&self) -> &BTreeMap<K, f64>;
//     
//     /// Gets a mutable reference to the positions map
//     fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64>;
//     
//     /// Calculates a position based on reference item and placement preference.
//     /// Takes &mut self because it might trigger an internal rebalance.
//     /// Takes step_size to be used during rebalancing if needed.
//     fn calculate_position(&mut self, reference_key: Option<&K>, before: bool, step_size: f64) -> Result<f64, String>
//     where K: Clone + Ord + std::fmt::Debug;
//     
//     /// Rebalances all positions to be evenly spaced using the provided step_size
//     fn rebalance_positions(&mut self, step_size: f64);
// }

// /// Implementation for any BTreeMap-based positioned ordering
// impl<K: Ord + Clone> PositionedOrdering<K> for BTreeMap<K, f64> {
//     fn find_position_before(&self, target_pos: f64, default_step: f64) -> f64 {
//         let prev = self.values()
//             .filter(|&&pos| pos < target_pos)
//             .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
//             
//         match prev {
//             Some(prev_pos) => (prev_pos + target_pos) / 2.0,
//             None => target_pos - default_step // Use default_step
//         }
//     }

//     fn find_position_after(&self, target_pos: f64, default_step: f64) -> f64 {
//         let next = self.values()
//             .filter(|&&pos| pos > target_pos)
//             .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
//             
//         match next {
//             Some(next_pos) => (target_pos + next_pos) / 2.0,
//             None => target_pos + default_step // Use default_step
//         }
//     }
//     
//     fn get_positions(&self) -> &BTreeMap<K, f64> {
//         self
//     }
//     
//     fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64> {
//         self
//     }
//     
//     // calculate_position now contains the full logic, including proactive rebalancing check
//     fn calculate_position(&mut self, reference_key: Option<&K>, before: bool, step_size: f64) -> Result<f64, String>
//     where K: Clone + Ord + std::fmt::Debug { // Added Debug constraint for logging
//         
//         // Loop allows for one retry attempt after a rebalance.
//         for attempt in 0..2 {
//             match reference_key {
//                 Some(ref_key) => {
//                     // --- Get current reference position ---
//                     // Ensure reference key exists in the current state of the map
//                     let reference_pos = *self.get(ref_key)
//                         .ok_or_else(|| {
//                             // If the key disappeared after a rebalance, it's an issue.
//                             if attempt > 0 {
//                                 format!("Reference item (key: {:?}) lost after rebalance", ref_key) // TODO: Improve key display if possible
//                             } else {
//                                 "Reference item not found".to_string()
//                             }
//                         })?;

//                     // --- Determine immediate neighbours based on 'before' flag ---
//                     // We find the positions immediately adjacent to the *target insertion spot*.
//                     let (prev_pos_opt, next_pos_opt) = if before {
//                         // Target spot is just *before* reference_pos.
//                         // Neighbour before target spot: The item with the largest position < reference_pos.
//                         // Neighbour after target spot: The reference item itself.
//                         let prev = self.values()
//                             .filter(|&&pos| pos < reference_pos)
//                             .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal))
//                             .cloned(); // Clone value in case we need mutable borrow later for rebalance
//                         (prev, Some(reference_pos))
//                     } else {
//                         // Target spot is just *after* reference_pos.
//                         // Neighbour before target spot: The reference item itself.
//                         // Neighbour after target spot: The item with the smallest position > reference_pos.
//                         let next = self.values()
//                             .filter(|&&pos| pos > reference_pos)
//                             .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal))
//                             .cloned(); // Clone value
//                         (Some(reference_pos), next)
//                     };

//                     // --- Calculate potential new position ---
//                     let new_pos = match (prev_pos_opt, next_pos_opt) {
//                         (Some(prev), Some(next)) => (prev + next) / 2.0, // Between two items
//                         (None, Some(next)) => next - step_size,         // Before the first item (relative to ref)
//                         (Some(prev), None) => prev + step_size,         // After the last item (relative to ref)
//                         (None, None) => {
//                             // This case implies the reference key is the *only* item in the map.
//                             // Calculate position relative to the single reference item.
//                             if before { reference_pos - step_size } else { reference_pos + step_size }
//                         }
//                     };

//                     // --- Check if rebalance is needed ---
//                     let mut needs_rebalance = false;
//                     if let (Some(prev), Some(next)) = (prev_pos_opt, next_pos_opt) {
//                         // Check only when inserting BETWEEN two existing positions.
//                         let gap_before = new_pos - prev;
//                         let gap_after = next - new_pos;

//                         // Trigger rebalance if EITHER gap is too small OR if floating point precision loss occurred.
//                         if gap_before < REBALANCE_MIN_GAP_THRESHOLD 
//                            || gap_after < REBALANCE_MIN_GAP_THRESHOLD 
//                            || new_pos == prev // Precision loss check
//                            || new_pos == next // Precision loss check
//                         {
//                             needs_rebalance = true;
//                         }
//                     } 
//                     // No gap check needed when adding at the absolute start/end relative to the reference key,
//                     // but we still need the precision loss check in those cases.
//                     else if let (None, Some(next)) = (prev_pos_opt, next_pos_opt) { // Before first relative to ref
//                         if new_pos == next { needs_rebalance = true; }
//                     } else if let (Some(prev), None) = (prev_pos_opt, next_pos_opt) { // After last relative to ref
//                         if new_pos == prev { needs_rebalance = true; }
//                     }
//                     // Case (None, None) means only one item exists, no gaps/precision loss to check yet.

//                     // --- Perform rebalance or return position ---
//                     if needs_rebalance {
//                         if attempt == 0 {
//                             self.rebalance_positions(step_size);
//                             continue; // Go to the next iteration to recalculate with new positions
//                         } else {
//                             // If rebalance was needed even on the second attempt, it indicates a potential issue.
//                             // This could happen if step_size is too small for the number of items, causing
//                             // rebalanced gaps to *still* be below the threshold.
//                             // Use ic_cdk::println for logging on ICP.
//                             ic_cdk::println!("WARN: Rebalance triggered twice for reference_key: {:?}, before: {}. Proceeding with potentially suboptimal position.", reference_key, before);
//                             // Proceeding with the potentially suboptimal position calculated after the first rebalance attempt.
//                             // A hard error might be too disruptive. Log and return the current `new_pos`.
//                              return Ok(new_pos); 
//                             // Alternative: return Err("Failed to find suitable position even after rebalancing... L".to_string());
//                         }
//                     } else {
//                         // No rebalance needed, return the calculated position
//                         return Ok(new_pos);
//                     }
//                 }
//                 None => { // No reference key: Place at the absolute start or end of the list.
//                     if self.is_empty() {
//                         return Ok(0.0); // First item ever.
//                     }
//                     
//                     // No gap checks needed here, as we are extending the range.
//                     if before {
//                         // Find the minimum position in the current state.
//                         let min_pos = self.values().cloned().fold(f64::INFINITY, f64::min);
//                         return Ok(min_pos - step_size);
//                     } else {
//                         // Find the maximum position in the current state.
//                         let max_pos = self.values().cloned().fold(f64::NEG_INFINITY, f64::max);
//                         return Ok(max_pos + step_size);
//                     }
//                 }
//             }
//         } // End of loop

//         // Should be unreachable if logic is correct, but needed for compiler.
//         // This path is taken only if the loop completes without returning, 
//         // which implies the rebalance -> continue path was taken on attempt 0, 
//         // and then the code somehow exited the match without returning Ok or Err on attempt 1.
//         Err("Internal error: Failed to calculate position after rebalance logic.".to_string())
//     }
//     
//     fn rebalance_positions(&mut self, step_size: f64) {
//         if self.is_empty() {
//             return;
//         }
//         
//         // Get ordered keys by collecting and copying data to avoid borrow issues
//         let mut ordered_pairs: Vec<(K, f64)> = Vec::new();
//         for (key, &value) in self.iter() {
//             ordered_pairs.push((key.clone(), value));
//         }
//         
//         // Sort the pairs by position value
//         ordered_pairs.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(Ordering::Equal));
//         
//         // Reset positions to be evenly spaced
//         // Start from step_size to avoid 0.0, making calculations near the start consistent
//         let mut current_pos = step_size; 
//         for (key, _) in ordered_pairs {
//             self.insert(key, current_pos);
//             current_pos += step_size;
//         }
//     }
// }

// Helper functions that can be used by both Shelf and Profile ordering

// /// Helper for getting ordered items based on their positions
// pub fn get_ordered_by_position<K: Clone + Ord, V: Clone>(
//     items: &BTreeMap<K, V>,
//     positions: &BTreeMap<K, f64>
// ) -> Vec<V> {
//     let mut ordered: Vec<_> = positions.iter().collect();
//     ordered.sort_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(Ordering::Equal));
//     
//     ordered.into_iter()
//         .filter_map(|(key, _)| items.get(key).map(|item| item.clone()))
//         .collect()
// } 