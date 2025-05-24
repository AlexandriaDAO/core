<!-- # Perpetua Canister Audit

This audit reviews the backend Rust files for the Perpetua canister, focusing on critical vulnerabilities that could lead to data corruption or exploitation.

## File-by-File Audit Summary

### `Cargo.toml`
- **Audit Result**: Looks pretty good.
- **Details**: Dependencies are explicitly versioned. No immediate critical vulnerabilities identified.

### `perpetua.did`
- **Audit Result**: Looks pretty good.
- **Details**: The interface is well-defined. Consider API versioning for future breaking changes, but not a current vulnerability. No critical vulnerabilities identified.

### `perpetua.md`
- **Audit Result**: Looks pretty good.
- **Details**: This file is for documentation and notes, not executable canister code.

### `src/auth.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: Theoretical race condition in `get_shelf_parts_for_owner_mut` and `get_shelf_parts_for_edit_mut` if `SHELF_DATA` could be modified between auth check and data loading within a single call. Unlikely given canister single-threaded execution per message.
- **Severity**: Low.
- **Improvement**: Ensure callbacks don't introduce exploitable side effects. Current structure is mostly sound.

### `src/guard.rs`
- **Audit Result**: Looks pretty good.
- **Details**: The `not_anon` guard is simple and correctly implemented. Standard security measure.

### `src/lib.rs`
- **Audit Result**: Generally good, one area of concern.
- **Potential Issue**: `get_principal` function uses `expect` for parsing Principal IDs from strings (e.g., for `ICRC7_CANISTER_ID`). If these hardcoded constants are ever malformed or if the function is used with dynamic, invalid input, it will trap.
- **Severity**: Low (if constants verified and static) to Medium (if dynamic/untrusted input).
- **Improvement**: For robustness with dynamic inputs, change `expect` to return a `Result`. For hardcoded constants, ensure correctness and consider build-time/test-time verification. -->



<!-- ### `src/ordering.rs` (`PositionTracker`)
- **Audit Result**: Sophisticated solution, but with risks related to floating-point precision.
- **Potential Issue**: Relies on `f64` for fractional indexing. Finite precision can lead to `new_pos == prev` or `new_pos == next` after many insertions, losing the ability to insert. Rebalance mechanism (`rebalance_positions`, `REBALANCE_MIN_GAP_THRESHOLD`) mitigates this but might not always suffice.
- **Severity**: Medium.
- **Exploitability**: Repeated insertions in a small range could trigger rebalances. If the "suboptimal position" after a double rebalance attempt collides with an existing `OrderedFloat` key in `keys_by_position: BTreeMap<OrderedFloat, K>`, it could overwrite the previous key at that position, corrupting ordering data.
- **Improvement**:
  - Fixed for collisoin resistance. -->

<!-- ### `src/query/follows.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: `get_my_followed_tags` and `get_my_followed_users` fetch all followed items. If a user follows an extremely large number, this could lead to large data transfer and high cycle costs.
- **Severity**: Low to Medium (scalability/performance, not data corruption).
- **Improvement**: Consider pagination for these "get_my_*" queries if very large follow sets are expected. -->

<!-- ### `src/query/shelves.rs`
- **Audit Result**: Generally good, one potential data exposure.
- **Potential Issue (Data Consistency & Missing Data)**: Functions querying indexes (e.g., `GLOBAL_TIMELINE`) then `SHELF_DATA` gracefully handle missing `ShelfData` by logging and skipping. This is good for preventing traps but can lead to incomplete results.
- **Potential Issue (`get_public_shelves_by_tag`)**: This function fetches shelves by tag but does *not* appear to have an explicit filter to return only *public* shelves after retrieving `ShelfData`. If `TAG_SHELF_CREATION_TIMELINE_INDEX` can contain non-public shelves, this function might return them, potentially leaking private shelf data.
    - **Severity (`get_public_shelves_by_tag` data exposure)**: Medium.
    - **Improvement (`get_public_shelves_by_tag`)**: Add an explicit filter (e.g., `if shelf_data_ref.metadata.public_editing { ... }`) or ensure the source index only contains public shelves.
- **Potential Issue (`get_shuffled_by_hour_feed`)**: Seed for shuffling uses full nanosecond timestamp. If "hourly" distinct shuffles were intended, seed should be `current_timestamp_ns / NANOS_PER_HOUR`. Current behavior is more frequent reshuffling.
- **Overall**: Most queries are robust. Complexity of `get_user_shelves` needs thorough testing. -->

<!-- ### `src/storage/common_types.rs`
- **Audit Result**: Looks pretty good.
- **Details**: Defines type aliases and constants (limits, step sizes). Important for business rule enforcement.

### `src/storage/follow_storage.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: `PrincipalSet` and `NormalizedTagSet` can grow large for users with many follows, leading to high cycle costs for read/write of these sets due to full deserialization/serialization.
- **Severity**: Low (performance/cycle cost).
- **Overall**: Standard use of stable structures.

### `src/storage/mod.rs` (storage module)
- **Audit Result**: Looks pretty good.
- **Details**: Organizes storage submodules and initializes `MEMORY_MANAGER`.

### `src/storage/nft_storage.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: `StringVec` (list of shelf IDs per NFT) can grow large if an NFT is in many shelves, leading to high cycle costs for read/write.
- **Severity**: Low (performance/cycle cost).

### `src/storage/random_feed_storage.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: `refresh_random_shelf_candidates` iterates over all of `SHELF_DATA`. If `SHELF_DATA` is huge, this can be cycle-intensive.
- **Severity**: Low (performance for refresh).
- **Details**: Reservoir sampling logic (`Algorithm R`) is correctly implemented. Function is `#[allow(dead_code)]`; remove if used. -->


<!-- ### `src/storage/shelf_storage.rs`
- **Audit Result**: Core logic with one significant area for improvement.
- **Potential Issue (Deep Circular References for Nested Shelves)**: The `Shelf::insert_item` checks for direct self-reference and 1-level deep cycles when adding `ItemContent::Shelf`. However, it does **not** prevent deeper circular dependencies (e.g., A contains B, B contains C, C contains A).
    - **Severity**: Medium. Such cycles can lead to infinite loops or excessive computation during rendering/traversal, impacting availability.
    - **Improvement**:
        1.  Disallow shelves within shelves.
        2.  Implement a nesting depth limit.
        3.  **Recommended**: At query time (when resolving/displaying nested shelves), implement traversal depth limits and a visited set to prevent infinite recursion. Full synchronous cycle detection during updates can be too complex/costly.
- **`MAX_APPEARS_IN_COUNT`**: Defined but enforcement not shown in this file (likely in `update/item.rs`).
- **Overall**: Structures are well-defined. Circular reference for nested shelves is the main concern. `PositionTracker` use inherits its risks. -->

<!-- ### `src/storage/tag_storage.rs`
- **Audit Result**: Good structure, consistency is key.
- **Potential Issue (Index Inconsistency)**: Multiple tag-related indexes (`TAG_METADATA`, `TAG_SHELF_ASSOCIATIONS`, etc.) must be updated atomically and correctly. Bugs in these updates (likely in `update/tags.rs` helpers) could lead to inconsistent query results (a form of data corruption).
    - **Severity**: Medium to High.
    - **Improvement**: Thoroughly review and test all update paths in `update/tags.rs` that modify these indexes to ensure atomicity and correctness.
- **Overall**: Indexes support queries well. Robustness depends on consistent updates. -->
<!-- 
### `src/storage/user_storage.rs`
- **Audit Result**: Looks pretty good.
- **Potential Issue**: `TimestampedShelves` and `UserProfileOrder::shelf_positions` can grow large, leading to cycle costs. `PositionTracker` use inherits its risks.
- **Severity**: Low (performance, inherited `PositionTracker` risks).

### `src/types.rs` (top-level types)
- **Audit Result**: Looks pretty good.
- **Details**: Defines key structures and backup-related types. `Storable` and `Ord` implementations seem correct.

### `src/update/access.rs`
- **Audit Result**: Looks pretty good.
- **Details**: `toggle_shelf_public_access` has good consistency checks between `SHELF_DATA` and `GLOBAL_TIMELINE`. Atomicity for the two-phase read-commit relies on IC message seriality.

### `src/update/debug.rs`
- **Audit Result**: Looks pretty good (empty file).

### `src/update/follow.rs`
- **Audit Result**: Looks pretty good.
- **Details**: Logic for follow/unfollow is straightforward, handles limits and idempotency correctly.
- **Consideration**: Currently allows following non-existent tags (not in `TAG_METADATA`). This is a design choice. -->

<!-- ### `src/update/item.rs`
- **Audit Result**: Very good, handles complex interactions.
- **Deep Circular Reference Check (`would_create_cycle`)**: Implements DFS, which is a significant improvement.
    - **Potential Issue**: Performance of DFS for very complex/deep shelf structures could be a concern for cycle costs during updates.
    - **Severity**: Low to Medium (performance).
- **Atomicity**: "Read & Validate, Prepare, Commit" pattern for updates to `SHELF_DATA`, `NFT_SHELVES` is good for consistency within a message.
- **NFT Ownership**: Relies on async `verify_nft_ownership` call.
- **Overall**: Robust handling of item operations and nested structures.

### `src/update/mod.rs` (update module)
- **Audit Result**: Looks pretty good (organizational file).
- **Note**: Content provided in prompt for this file seemed to list different modules than actual file structure. Assumed it's for re-exporting actual submodules.

### `src/update/profile.rs`
- **Audit Result**: Looks pretty good.
- **Details**: Handles profile shelf reordering. Shelf ownership verification is sound. Sensible handling of items not yet in `PositionTracker`. Inherits `PositionTracker` risks.

### `src/update/shelf.rs`
- **Audit Result**: Good, manages multi-map updates.
- **Atomicity**: `store_shelf` coordinates writes to `SHELF_DATA`, `NFT_SHELVES`, `USER_SHELVES`, `GLOBAL_TIMELINE`, and tag maps (via `add_tag_to_metadata_maps`). Relies on IC message atomicity and panics in helper functions (like `add_tag_to_metadata_maps`) for full consistency.
- **`GLOBAL_TIMELINE` Timestamp Collision**: Nanosecond precision makes this rare. Current replacement behavior is acceptable for a timeline.
- **Overall**: Structure for creating shelves and updating metadata is sound. -->

<!-- ### `src/update/tags.rs`
- **Audit Result**: Critical for tag consistency; main concern is performance.
- **`add_tag_to_metadata_maps` / `remove_tag_from_metadata_maps`**:
    - **Atomicity**: These helpers perform multiple BTree map writes. They should robustly panic if any sub-operation fails (currently relies on BTree ops panicking on out of memory/cycles).
    - **Performance of Shelf Count Recalculation**: Iterating `TAG_SHELF_ASSOCIATIONS` to count shelves per tag (`map.iter().filter(...).count()`) can be very slow for popular tags.
        - **Severity**: Medium (performance).
        - **Improvement**: Modify `TagMetadata.current_shelf_count` incrementally instead of full recalculation. This requires ensuring every add/remove path updates it perfectly.
- **Overall**: Logic is complex but aims for consistency. Performance of count recalculation is a key area for optimization.

### `src/update/utils.rs`
- **Audit Result**: Generally good; external dependency is key.
- **`verify_nft_ownership`**:
    - **Security**: Relies entirely on the security and correctness of external ICRC7 canisters.
    - **Severity**: High (if external ICRC7 canisters are flawed, ownership check is void). This is an external dependency risk.
    - **ID Length Heuristic**: Logic for distinguishing SBTs vs. NFTs (`nft_id.len() > 90`) must be robust and maintained.
- **`is_self_reference`**: Basic check, superseded by `would_create_cycle` in `item.rs` for actual nested shelf additions. -->

<!-- ### `src/utils.rs` (top-level utils)
- **Audit Result**: `normalize_tag` is good; `generate_shelf_id` needs clarification.
- **`generate_shelf_id`**: Different implementation than shelf ID generation in `storage::create_shelf`. Uses `raw_rand()` and hash truncation to 12 bytes.
    - **Potential Issue**: If used, ensure 12-byte truncated hash offers sufficient collision resistance. If unused, it's dead code.
    - **Severity**: Low (collision if used and space is too small; 96 bits is generally large).
- **`normalize_tag`**: Good and widely used (`trim().to_lowercase()`). -->

## Overall Critical Vulnerabilities & Key Improvement Areas

<!-- 1.  **Deep Circular References in Nested Shelves (`src/storage/shelf_storage.rs` via `src/update/item.rs`)**:
    *   **Current State**: `would_create_cycle` in `item.rs` is a good DFS-based detection mechanism for *newly added* items.
    *   **Concern**: While adding new items is protected, existing data or complex scenarios might still be an area to watch. The primary mitigation is usually at query/display time by limiting depth and tracking visited nodes.
    *   **Severity**: Medium. -->

<!-- 2.  **Floating Point Precision in `PositionTracker` (`src/ordering.rs`)**:
    *   **Concern**: Can lead to inability to insert items or incorrect ordering if rebalancing fails to create sufficient gaps, or if `OrderedFloat` keys collide in `keys_by_position` map.
    *   **Severity**: Medium.
    *   **Action**: Implement robust collision handling in `keys_by_position` (e.g., `BTreeMap<OrderedFloat, Vec<K>>`). Strengthen logic for "suboptimal positions" after failed rebalance attempts. -->

3.  **Consistency of Tag Indexes (`src/update/tags.rs` & `src/storage/tag_storage.rs`)**:
    *   **Concern**: Multiple BTreeMaps store tag data. All must be updated atomically. Performance of shelf count recalculation in `add/remove_tag_from_metadata_maps` is also a concern for popular tags.
    *   **Severity**: Medium to High (for data inconsistency if updates fail partially), Medium (for performance).
    *   **Action**: Ensure helper functions (`add_tag_to_metadata_maps`, etc.) are fully atomic (panic on any partial failure). Optimize shelf count updates (e.g., incremental updates to `TagMetadata.current_shelf_count`).

<!-- 4.  **Potential Data Exposure in `get_public_shelves_by_tag` (`src/query/shelves.rs`)**:
    *   **Concern**: May return non-public shelves if the underlying index contains them and no explicit public filter is applied after fetching `ShelfData`.
    *   **Severity**: Medium.
    *   **Action**: Add explicit filtering for public shelves or ensure the source index (`TAG_SHELF_CREATION_TIMELINE_INDEX`) only ever contains public ones. -->

<!-- ## General Recommendations
- **Testing**: Given the complexity, especially around stateful updates to multiple indexes and the `PositionTracker`, comprehensive unit and integration testing covering edge cases, concurrency (simulated, as IC is single-threaded per message), and boundary conditions is vital.
- **Performance Profiling**: For operations like tag count recalculation or deep cycle checks, profiling under load can identify bottlenecks.
- **Monitoring & Logging**: The existing `ic_cdk::println!` for warnings/errors is good. Consider structured logging if more advanced monitoring is needed.

This audit provides a snapshot based on the code. Continuous review, especially around new features or refactoring of stateful logic, is recommended. -->