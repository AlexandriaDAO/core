/// Multiplier calculation for Mines game
///
/// Formula: fair_multiplier = 1 / P(surviving N clicks with M mines)
/// actual_multiplier = fair_multiplier × (1 - house_edge)
///
/// P(surviving N clicks) = Product of (remaining_safe / remaining_total) for each click
use crate::constants::HOUSE_EDGE;

/// Calculate multiplier after N successful clicks
///
/// Arguments:
/// - total_tiles: Total tiles in grid (16 for 4x4)
/// - mine_count: Number of mines
/// - revealed_count: Number of safe tiles already revealed
///
/// Returns the multiplier for the next cashout
pub fn calculate_multiplier(total_tiles: u8, mine_count: u8, revealed_count: u8) -> f64 {
    if revealed_count == 0 {
        return 1.0;
    }

    let safe_tiles = total_tiles - mine_count;

    // Can't reveal more safe tiles than exist
    if revealed_count > safe_tiles {
        return 0.0;
    }

    // Calculate probability of surviving all clicks
    // P = (safe/total) × ((safe-1)/(total-1)) × ... × ((safe-n+1)/(total-n+1))
    let mut probability = 1.0;

    for i in 0..revealed_count {
        let remaining_safe = (safe_tiles - i) as f64;
        let remaining_total = (total_tiles - i) as f64;
        probability *= remaining_safe / remaining_total;
    }

    if probability <= 0.0 {
        return 0.0;
    }

    // Fair multiplier = 1 / probability
    let fair_multiplier = 1.0 / probability;

    // Apply house edge
    let actual_multiplier = fair_multiplier * (1.0 - HOUSE_EDGE);

    // Round to 4 decimal places
    (actual_multiplier * 10000.0).round() / 10000.0
}

/// Calculate multiplier for the next click (preview)
pub fn calculate_next_multiplier(total_tiles: u8, mine_count: u8, current_revealed: u8) -> f64 {
    calculate_multiplier(total_tiles, mine_count, current_revealed + 1)
}

/// Calculate potential win amount
pub fn calculate_potential_win(bet_amount: u64, multiplier: f64) -> u64 {
    ((bet_amount as f64) * multiplier) as u64
}

/// Get multiplier table for a given mine count
/// Shows multiplier progression for each click
pub fn get_multiplier_table(mine_count: u8) -> Vec<f64> {
    let total_tiles: u8 = 16;
    let safe_tiles = total_tiles - mine_count;

    (1..=safe_tiles)
        .map(|clicks| calculate_multiplier(total_tiles, mine_count, clicks))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zero_clicks() {
        let mult = calculate_multiplier(16, 3, 0);
        assert_eq!(mult, 1.0);
    }

    #[test]
    fn test_one_click_three_mines() {
        // With 3 mines, 13 safe tiles out of 16
        // P = 13/16 = 0.8125
        // Fair mult = 1/0.8125 = 1.2308
        // Actual = 1.2308 * 0.975 ≈ 1.20
        let mult = calculate_multiplier(16, 3, 1);
        assert!(mult > 1.0 && mult < 1.3);
    }

    #[test]
    fn test_multiplier_increases() {
        let mult1 = calculate_multiplier(16, 5, 1);
        let mult2 = calculate_multiplier(16, 5, 2);
        let mult3 = calculate_multiplier(16, 5, 3);

        assert!(mult2 > mult1);
        assert!(mult3 > mult2);
    }

    #[test]
    fn test_more_mines_higher_multiplier() {
        let mult_3_mines = calculate_multiplier(16, 3, 5);
        let mult_10_mines = calculate_multiplier(16, 10, 5);

        assert!(mult_10_mines > mult_3_mines);
    }

    #[test]
    fn test_max_safe_clicks() {
        // With 10 mines, can click 6 safe tiles
        let mult = calculate_multiplier(16, 10, 6);
        assert!(mult > 1.0);

        // Can't click more than safe tiles exist
        let invalid = calculate_multiplier(16, 10, 7);
        assert_eq!(invalid, 0.0);
    }

    #[test]
    fn test_multiplier_table() {
        let table = get_multiplier_table(5);
        assert_eq!(table.len(), 11); // 16 - 5 = 11 safe tiles

        // Each entry should be higher than the previous
        for i in 1..table.len() {
            assert!(table[i] > table[i - 1]);
        }
    }
}
