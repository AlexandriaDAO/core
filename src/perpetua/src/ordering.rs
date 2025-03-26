use std::collections::BTreeMap;
use std::cmp::Ordering;

/// Trait defining the core ordering operations used across the application.
/// This abstraction works with different key types while sharing the same positioning logic.
pub trait PositionedOrdering<K> {
    /// Finds a position that would place an item before the target position
    fn find_position_before(&self, target_pos: f64) -> f64;
    
    /// Finds a position that would place an item after the target position
    fn find_position_after(&self, target_pos: f64) -> f64;
    
    /// Gets a map of all positions
    fn get_positions(&self) -> &BTreeMap<K, f64>;
    
    /// Gets a mutable reference to the positions map
    fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64>;
    
    /// Calculates a position based on reference item and placement preference
    fn calculate_position(&self, reference_key: Option<&K>, before: bool, default_step: f64) -> Result<f64, String>
    where K: Clone;
    
    /// Checks if positions need rebalancing
    fn needs_rebalancing(&self, thresholds: &[(usize, f64)]) -> bool;
    
    /// Rebalances all positions to be evenly spaced
    fn rebalance_positions(&mut self, step_size: f64);
}

/// Implementation for any BTreeMap-based positioned ordering
impl<K: Ord + Clone> PositionedOrdering<K> for BTreeMap<K, f64> {
    fn find_position_before(&self, target_pos: f64) -> f64 {
        let prev = self.values()
            .filter(|&&pos| pos < target_pos)
            .max_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
            
        match prev {
            Some(prev_pos) => (prev_pos + target_pos) / 2.0,
            None => target_pos - 1.0  // Default step can be customized by caller
        }
    }

    fn find_position_after(&self, target_pos: f64) -> f64 {
        let next = self.values()
            .filter(|&&pos| pos > target_pos)
            .min_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
            
        match next {
            Some(next_pos) => (target_pos + next_pos) / 2.0,
            None => target_pos + 1.0  // Default step can be customized by caller
        }
    }
    
    fn get_positions(&self) -> &BTreeMap<K, f64> {
        self
    }
    
    fn get_positions_mut(&mut self) -> &mut BTreeMap<K, f64> {
        self
    }
    
    fn calculate_position(&self, reference_key: Option<&K>, before: bool, default_step: f64) -> Result<f64, String>
    where K: Clone {
        match reference_key {
            Some(ref_key) => {
                // Get reference position
                let reference_pos = self.get(ref_key)
                    .ok_or_else(|| "Reference item not found".to_string())?;
                
                // Calculate new position based on reference and placement preference
                if before {
                    Ok(self.find_position_before(*reference_pos))
                } else {
                    Ok(self.find_position_after(*reference_pos))
                }
            },
            None => {
                // No reference item, place at start or end
                if before {
                    // Place at beginning
                    let min_pos = self.values()
                        .fold(f64::INFINITY, |a, &b| a.min(b));
                    
                    if min_pos == f64::INFINITY {
                        Ok(0.0) // No items yet
                    } else {
                        Ok(min_pos - default_step)
                    }
                } else {
                    // Place at end
                    let max_pos = self.values()
                        .fold(f64::NEG_INFINITY, |a, &b| a.max(b));
                    
                    if max_pos == f64::NEG_INFINITY {
                        Ok(0.0) // No items yet
                    } else {
                        Ok(max_pos + default_step)
                    }
                }
            }
        }
    }
    
    fn needs_rebalancing(&self, thresholds: &[(usize, f64)]) -> bool {
        if self.len() < 2 {
            return false;
        }
        
        // Collect and sort positions
        let mut positions: Vec<f64> = self.values().cloned().collect();
        positions.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
        
        // Find minimum gap between consecutive positions
        let mut min_gap = f64::MAX;
        for i in 1..positions.len() {
            let gap = positions[i] - positions[i-1];
            min_gap = min_gap.min(gap);
        }
        
        // Determine threshold based on number of items
        let count = self.len();
        let threshold = thresholds.iter()
            .find(|(size, _)| count > *size)
            .map(|(_, threshold)| *threshold)
            .unwrap_or(1e-6); // Default threshold
        
        min_gap < threshold
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
        for (i, (key, _)) in ordered_pairs.into_iter().enumerate() {
            self.insert(key, (i as f64) * step_size);
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

/// Helper for ensuring positions are properly balanced
pub fn ensure_balanced_positions<K: Ord + Clone>(
    positions: &mut BTreeMap<K, f64>,
    thresholds: &[(usize, f64)],
    step_size: f64
) {
    if positions.needs_rebalancing(thresholds) {
        positions.rebalance_positions(step_size);
    }
} 