```
Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (413 lines)
│   │   │   ├── ContentDisplays.tsx (103 lines)
│   │   │   ├── NftDisplay.tsx (298 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (276 lines)
│   │   │   ├── ShelfCardActionMenu.tsx (159 lines)
│   │   │   ├── ShelfContentCard.tsx (131 lines)
│   │   │   ├── ShelfContentModal.tsx (79 lines)
│   │   │   ├── ShelfDetailView.tsx (227 lines)
│   │   │   ├── ShelfEmptyView.tsx (32 lines)
│   │   │   ├── ShelfGridView.tsx (57 lines)
│   │   │   ├── ShelfViewControls.tsx (127 lines)
│   │   │   ├── ShelfViewHeader.tsx (92 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useNftData.ts (156 lines)
│   │   └── utils/
│   │       └── ShelfViewUtils.ts (32 lines)
│   ├── items/
│   │   ├── components/
│   │   │   ├── AlexandrianSelector.tsx (223 lines)
│   │   │   ├── InlineItemCreator.tsx (433 lines)
│   │   │   └── index.ts (5 lines)
│   │   ├── hooks/
│   │   │   └── useItemActions.tsx (116 lines)
│   │   └── index.ts (2 lines)
│   ├── shared/
│   │   └── reordering/
│   │       ├── components/
│   │       │   ├── ItemReorderManager.tsx (22 lines)
│   │       │   ├── ReorderableContainer.tsx (63 lines)
│   │       │   ├── ReorderableGrid.tsx (97 lines)
│   │       │   ├── ReorderableList.tsx (80 lines)
│   │       │   └── index.ts (4 lines)
│   │       ├── hooks/
│   │       │   ├── index.ts (4 lines)
│   │       │   ├── useDragAndDrop.ts (108 lines)
│   │       │   ├── useItemReordering.ts (80 lines)
│   │       │   ├── useReorderable.ts (217 lines)
│   │       │   └── useShelfReordering.ts (70 lines)
│   │       └── utils/
│   │           ├── createReorderAdapter.ts (49 lines)
│   │           └── reorderUtils.ts (32 lines)
│   ├── shelf-collaboration/
│   │   └── components/
│   │       └── CollaboratorsList.tsx (185 lines)
│   ├── shelf-management/
│   │   ├── components/
│   │   │   ├── NewShelf.tsx (104 lines)
│   │   │   ├── RemoveItemButton.tsx (98 lines)
│   │   │   ├── ShelfContent.tsx (80 lines)
│   │   │   ├── ShelfOption.tsx (31 lines)
│   │   │   └── ShelfSelectionDialog.tsx (158 lines)
│   │   ├── containers/
│   │   │   ├── ShelfDetailContainer.tsx (169 lines)
│   │   │   └── ShelfLists.tsx (217 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (132 lines)
│   │       ├── usePublicShelfOperations.ts (62 lines)
│   │       └── useShelfOperations.ts (214 lines)
│   └── shelf-settings/
│       ├── components/
│       │   ├── ShelfMetricsDisplay.tsx (143 lines)
│       │   ├── ShelfSettings.tsx (191 lines)
│       │   ├── ShelfSettingsDialog.tsx (378 lines)
│       │   └── index.ts (3 lines)
│       ├── hooks/
│       │   ├── index.ts (2 lines)
│       │   ├── useShelfMetadata.ts (86 lines)
│       │   └── useShelfMetrics.ts (40 lines)
│       ├── index.ts (3 lines)
│       └── utils/
│           └── index.ts (2 lines)
├── hooks/
│   └── useContentPermissions.ts (75 lines)
├── index.tsx (22 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (220 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (209 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (147 lines)
│   │   └── usePerpetuaSelectors.ts (62 lines)
│   ├── index.ts (49 lines)
│   ├── perpetuaSlice.ts (666 lines)
│   ├── services/
│   │   └── perpetuaService.ts (580 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (106 lines)
│   │   ├── index.ts (6 lines)
│   │   ├── itemThunks.ts (92 lines)
│   │   ├── queryThunks.ts (151 lines)
- Add number of items as a shelf details.
│   │   ├── reorderThunks.ts (117 lines)
│   │   └── shelfThunks.ts (152 lines)
├── types/
│   ├── item.types.ts (27 lines)
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (74 lines)
└── utils.tsx (136 lines)
```




Backend Stuff:
- Make public, i.e., anyone can edit a shelf.
- Payment for all/some actions (maybe we do an action count for all backend calls, after certain actions you must pay X lbry).
- 'Following' with your feed being the latest of those you're following? Could we make a query function for that?



Frontend Stuff:
- PerpetuaSlice needs: (editors, appears_in.length(), public or private)
- Add appears-in in the frontend.
- Test collborator list stuff.
 


## V2 Features: 

- Backup system for all data.
- A preview of the slots in the profile. (Could be done later)













## Cleanup commands. 


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json




dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua









# Backend ToDos:
- Make sure add_item_to_shelf has the proper type checks. Right now, I just use the frontend to determine if it's 'shelf', 'nft' or 'markdown'.

# Code Review and Optimization Suggestions

## Security and Vulnerability Suggestions

1. **Validate item content more rigorously**
   - Current validation for `ItemContent` is limited. Add size limits and content validation especially for Markdown content.

2. **Implement proper rate limiting for all write operations**
   - Currently only tag operations have rate limiting. Extend to all modifying operations.

3. **Add transaction logging for audit purposes**
   - Log all modifications with timestamps and principals for security auditing.

4. **Prevent unbounded growth of auxiliary data structures**
   - Implement cleanup mechanisms for `NFT_SHELVES`, `GLOBAL_TIMELINE`, etc.

5. **Add memory bounds checking for stable storage**
   - Monitor and limit total canister memory usage to prevent out-of-memory errors.

6. **Add a mechanism for shelf data backup and recovery**
   - Provide a way to export and import shelf data for disaster recovery.

7. **Implement cross-canister call authentication**
   - When interacting with NFT canisters, verify the caller in both directions.

8. **Add periodic data integrity checks**
   - Ensure all cross-references remain valid and clean up any inconsistencies.

9. **Implement proper pagination for all query functions**
   - This prevents large result sets from causing timeouts or memory issues.

10. **Validate shelf title and description for size and content**
    - Add character limits and content sanitization.

## Performance Optimizations

1. **Review circular reference detection algorithm for efficiency**
   - The current implementation in `Shelf::has_circular_reference` may cause excessive SHELVES lookups.

2. **Batch update operations when possible**
   - Group related updates to reduce the number of stable storage operations.

3. **Implement more efficient popularity-based ordering**
   - Current implementation in `reorder_shelves_by_popularity` rebuilds the entire ordering.

4. **Review position rebalancing thresholds**
   - Current thresholds may trigger rebalancing too frequently with large shelves.

5. **Optimize tag prefix indexing**
   - Consider more efficient data structures for prefix search operations.

6. **Cache frequently accessed shelves**
   - Implement a short-lived in-memory cache for frequently accessed shelves.

7. **Use binary serialization instead of Candid for stable storage**
   - Consider optimizing serialization format for Shelf structures.

8. **Optimize ordering operations for large collections**
   - The ordering logic may be inefficient for shelves with hundreds of items.

9. **Minimize cloning of large data structures**
   - Many operations clone the entire Shelf structure unnecessarily.

10. **Use more granular data structures**
    - Split large Shelf objects into components that can be updated independently.





































PRD For Rebalance Changes Gemini.
---

## PRD: Lexicographical String-Based Positioning

**1. Goals**

*   Simplify the item/shelf ordering mechanism by removing the need for periodic rebalancing.
*   Eliminate complexity associated with floating-point precision issues, thresholds, and state tracking (`needs_rebalance`, `rebalance_count`).
*   Maintain the efficiency of ordering operations (insertion, deletion, moving, querying ordered lists), leveraging the underlying `StableBTreeMap`.
*   Fully support drag-and-drop style reordering for single and potentially multiple items without performance degradation compared to the current system (excluding the overhead of the removed rebalancing step).

**2. Non-Goals**

*   Changing the core storage structures (`SHELVES`, `USER_SHELVES`, etc.) other than the position value type.
*   Modifying authentication or authorization logic.
*   Altering the functionality of tags, shelf metadata updates, or NFT tracking beyond how they relate to item ordering.
*   Introducing new user-facing features related to ordering beyond what drag-and-drop implies.

**3. Background**

The current system uses `f64` values to represent the position of items within a `Shelf` (`item_positions`) and shelves within a user's profile (`shelf_positions`). To insert an item between two others, a midpoint `f64` is calculated. Due to limited floating-point precision, repeatedly inserting items between close positions can lead to gaps becoming too small to represent accurately.

To mitigate this, a rebalancing mechanism exists:
*   It tracks when adjacent positions become too close (`needs_rebalance` flag) based on defined `THRESHOLDS`.
*   When triggered (explicitly or implicitly), it recalculates and assigns new, evenly spaced `f64` positions to *all* items in the collection.
*   This adds complexity: state flags, threshold constants, rebalancing functions (`rebalance_positions`, `check_position_spacing`, etc.), and potential performance hits during the rebalance itself.
*   The `reorder_shelves_by_popularity` function also performs a full reordering/repositioning based on external data, adding another layer of complexity tied to the positioning system.

This PRD proposes replacing this `f64` + rebalancing system with lexicographical string positioning, which avoids precision limits and eliminates the need for rebalancing entirely.

**4. Proposed Solution: Lexicographical String Positioning**

The core idea is to replace `f64` position values with `String` values. The relative order of items is determined by the standard alphabetical (lexicographical) sorting of these string positions.

*   **Data Structure:** Position maps will become `StableBTreeMap<KeyType, String>`.
*   **Insertion/Moving:** To position an item between two others (with string positions `pos_A` and `pos_B`), a new string `pos_X` is generated such that `pos_A < pos_X < pos_B` lexicographically. Algorithms exist to always find such a string.
*   **No Rebalancing:** Since a valid string can always be generated between any two existing strings, the positions never "run out" of space or precision, eliminating the need for rebalancing.
*   **Efficiency:** Operations rely on the O(log N) characteristics of `StableBTreeMap` for lookups/updates and efficient string comparisons/generation. Querying the ordered list still involves iterating and sorting based on the position value (now a string).

**5. Detailed Design & Implementation (Pseudocode / Descriptions)**

**5.1. New File/Module: `src/perpetua/src/string_positioning.rs` (or similar)**

*   **Purpose:** Contains the core logic for generating lexicographical string positions.
*   **Key Function:**
    ```rust
    // Pseudocode
    fn generate_key_between(before: Option<&str>, after: Option<&str>) -> String {
        // Implementation based on known algorithms (e.g., using base-62 chars, midpoint logic on char codes, etc.)
        // Handles edge cases:
        // - before=None, after=None: Generate initial key (e.g., "m")
        // - before=Some(s), after=None: Generate key after 's' (e.g., if s="t", return "w")
        // - before=None, after=Some(s): Generate key before 's' (e.g., if s="f", return "c")
        // - before=Some(a), after=Some(b): Generate key between 'a' and 'b' (e.g., a="cat", b="dog" -> "catnap")
        //   - Handle cases where strings need lengthening (e.g., a="m", b="n" -> "mh")
    }
    ```

**5.2. File Changes: `src/perpetua/src/ordering.rs`**

*   **`PositionedOrdering<K>` Trait:**
    *   Remove methods: `find_position_before`, `find_position_after`, `needs_rebalancing`, `rebalance_positions`. These concepts are obsolete or handled by the new string generation.
    *   Modify `calculate_position`: Change signature and logic.
        ```rust
        // Pseudocode signature change
        trait PositionedOrdering<K> {
            // ... get_positions, get_positions_mut ...
            fn calculate_position_string(&self, reference_key: Option<&K>, before: bool) -> Result<String, String>
            where K: Ord + Clone;
        }
        ```
*   **`impl<K: Ord + Clone> PositionedOrdering<K> for BTreeMap<K, String>`:** (Note: Changed `f64` to `String`)
    *   Implement `calculate_position_string`:
        ```rust
        // Pseudocode
        fn calculate_position_string(&self, reference_key: Option<&K>, before: bool) -> Result<String, String> {
            match reference_key {
                Some(ref_key) => {
                    let reference_pos_str = self.get(ref_key).ok_or("Reference item not found")?;
                    if before {
                        // Find the key immediately before reference_key lexicographically
                        let prev_key = /* logic to find key with max pos_str < reference_pos_str */;
                        let prev_pos_str = prev_key.map(|k| self.get(k).unwrap());
                        Ok(string_positioning::generate_key_between(prev_pos_str.as_deref(), Some(reference_pos_str)))
                    } else {
                        // Find the key immediately after reference_key lexicographically
                        let next_key = /* logic to find key with min pos_str > reference_pos_str */;
                        let next_pos_str = next_key.map(|k| self.get(k).unwrap());
                        Ok(string_positioning::generate_key_between(Some(reference_pos_str), next_pos_str.as_deref()))
                    }
                },
                None => { // Placing at start or end
                    if before {
                         let min_pos_str = self.values().min().cloned(); // Find min string
                         Ok(string_positioning::generate_key_between(None, min_pos_str.as_deref()))
                    } else {
                         let max_pos_str = self.values().max().cloned(); // Find max string
                         Ok(string_positioning::generate_key_between(max_pos_str.as_deref(), None))
                    }
                }
            }
        }
        ```
    *   Remove implementation for `find_position_before`, `find_position_after`, `needs_rebalancing`, `rebalance_positions`.
*   **Helper Functions:**
    *   `get_ordered_by_position`: Modify to sort by `String` value instead of `f64`.
    *   Remove `ensure_balanced_positions`.

**5.3. File Changes: `src/perpetua/src/storage.rs`**

*   **Struct `Shelf`:**
    *   Change field: `item_positions: BTreeMap<u32, f64>` -> `item_positions: BTreeMap<u32, String>`.
    *   Remove fields: `needs_rebalance`, `rebalance_count`.
*   **Struct `UserProfileOrder`:**
    *   Change field: `shelf_positions: BTreeMap<String, f64>` -> `shelf_positions: BTreeMap<String, String>`.
*   **Constants:**
    *   Remove `SHELF_ITEM_THRESHOLDS`, `PROFILE_SHELF_THRESHOLDS`.
    *   Remove `SHELF_ITEM_STEP_SIZE`, `PROFILE_SHELF_STEP_SIZE`.
*   **`Storable` Implementations:**
    *   Update `impl Storable for Shelf` and `impl Storable for UserProfileOrder` `to_bytes`/`from_bytes` methods to correctly encode/decode the modified structs (with `String` positions and removed fields). The underlying `String` type is handled by Candid, but the struct layout changes.
*   **`impl Shelf`:**
    *   Update `insert_item`:
        *   Replace `calculate_position` call with `calculate_position_string`.
        *   Remove call to `check_position_spacing`.
    *   Update `move_item`:
        *   Replace `calculate_position` call with `calculate_position_string`.
        *   Remove call to `check_position_spacing`.
    *   Update `get_ordered_items`: Modify to use the updated helper `get_ordered_by_position` (which sorts by string).
    *   Remove methods: `check_position_spacing`, `rebalance_positions`, `ensure_balanced_positions`.
*   Remove constants related to rebalancing thresholds and step sizes.

**5.4. File Changes: `src/perpetua/src/update/item.rs`**

*   **`reorder_shelf_item`:**
    *   Internally, the call to `shelf.move_item` will now use the string-based logic. No other changes needed in this function itself.
*   **`add_item_to_shelf`:**
    *   The call to `shelf.insert_item` will use the new logic.
    *   The subsequent call to `shelf.move_item` (if `reference_item_id` is Some) will use the new logic.
    *   Remove call to `shelf.ensure_balanced_positions()`.
    *   Re-evaluate `reorder_shelves_by_popularity`:
        *   This function currently performs a full reorder/rebalance.
        *   *Proposal:* Modify it to calculate appropriate *string* positions based on the popularity sort (non-shelves first, then shelves by popularity). It should generate new string keys using `generate_key_between` iteratively for all items to achieve the desired order, rather than relying on numerical steps. It no longer needs to set `needs_rebalance=false` or increment `rebalance_count`.
*   **`remove_item_from_shelf`:**
    *   Remove call to `shelf.ensure_balanced_positions()`.
    *   The call to `reorder_shelves_by_popularity` needs the update described above.
*   **`create_and_add_shelf_item`:**
    *   The call to `parent_shelf.insert_item` uses new logic.
    *   The call to `reorder_shelves_by_popularity` needs the update described above.

**5.5. File Changes: `src/perpetua/src/update/shelf.rs`**

*   **Remove Function:** `rebalance_shelf_items` - This endpoint is no longer necessary.

**5.6. File Changes: `src/perpetua/src/update/profile.rs`**

*   **`reorder_profile_shelf`:**
    *   Replace call to `calculate_position` with `calculate_position_string`.
    *   Remove call to `ensure_balanced_positions`.
    *   Remove logic that auto-assigns a default `f64` position if the reference shelf didn't have one (the string generation handles missing neighbors).

**5.7. File Changes: `src/perpetua/src/query.rs`**

*   **`get_shelf_items`:**
    *   The underlying call to `shelf.get_ordered_items` will now return items sorted by string positions. No change needed here directly.
*   **`get_user_shelves`:**
    *   When retrieving shelves for a user with `is_customized = true`:
        *   The sorting of `ordered_positions` (`Vec<(String, String)>`) needs to be done lexicographically on the position string (the second element).
        *   The rest of the logic (combining ordered and timestamped) remains conceptually similar.
    *   When `is_customized = false`, the timestamp logic is unaffected.
*   **Remove Function:** `get_shelf_position_metrics` - The metrics it provides (gaps, `needs_rebalance`) are obsolete.
*   **Struct `ShelfPositionMetrics`:** Remove this struct definition.

**6. Impact**

*   **API:**
    *   Removes endpoints: `rebalance_shelf_items`, `get_shelf_position_metrics`.
    *   No changes to signatures of other update/query endpoints.
*   **Storage:**
    *   Slightly different storage footprint. String positions might take more or less space than `f64` depending on the implementation and length of strings generated. `needs_rebalance` (bool) and `rebalance_count` (u32) fields are removed, saving space. Overall impact likely minimal.
*   **Performance:**
    *   Read/Write operations remain O(log N) due to `StableBTreeMap`.
    *   String comparison/generation is generally very fast.
    *   Eliminates the potentially costly rebalancing step which involved iterating and updating *all* items (O(N log N) due to sorting or O(N) if already sorted).
    *   Overall performance for insertions/moves is expected to be more consistent and potentially faster on average by avoiding periodic full rebalances.
*   **User Experience:**
    *   Drag-and-drop functionality remains unchanged from the user's perspective.
    *   Potentially smoother experience as large rebalances causing slight delays are eliminated.

**7. Rollout / Testing**

*   Implement the `string_positioning::generate_key_between` function with thorough unit tests covering edge cases and repeated insertions.
*   Implement changes across all affected files.
*   Write comprehensive integration tests simulating:
    *   Adding items to start, end, middle.
    *   Moving items extensively.
    *   Handling shelves with many items.
    *   Profile reordering.
    *   Correctness of `get_ordered_items` and `get_user_shelves` (customized order).
    *   Interaction with `reorder_shelves_by_popularity`.
*   Deploy to a test environment and perform manual testing, focusing on drag-and-drop usability.

**8. Future Considerations**

*   Investigate existing robust libraries for lexicographical key generation if available for the target environment, potentially simplifying `string_positioning.rs`.
*   Consider if the logic in `reorder_shelves_by_popularity` could be further simplified or decoupled now that technical rebalancing is gone.

---
