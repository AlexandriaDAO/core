# Perpetua Canister Informal Audit (Update Calls & Storage)

This audit focuses on potential failure scenarios in update calls and storage structures that could lead to data loss or corruption.

## General Concerns Across Multiple Modules

*   **Atomicity of Multi-Map Updates**: Many operations involve updating multiple `StableBTreeMap` instances (e.g., `store_shelf` updates shelf data, user data, timeline, NFT data, and tag data; tag operations update several tag-specific maps). While individual `insert`/`remove` operations on a `StableBTreeMap` are atomic, a sequence of such operations across *different* maps is not. If a trap/panic occurs midway through such a sequence (e.g., due to `Encode!` error, OOM, or other unexpected issues), the system can be left in an inconsistent state. For example, a shelf might be created in `SHELVES` but not in `GLOBAL_TIMELINE`, or a tag added to a shelf's metadata but its indexes not updated.
    *   **Recommendation**: For critical multi-map updates, consider strategies like:
        1.  Designing operations to be idempotent and re-entrant where possible, so retries can fix inconsistencies.
        2.  Adding background reconciliation jobs or health checks that can detect and potentially fix inconsistencies (though this adds complexity).
        3.  Minimizing the number of distinct map updates per logical operation. Where possible, co-locate related data or use techniques that allow batch updates if the underlying storage supports it (which `StableBTreeMap` does not directly for cross-map transactions).
        4.  Strictly order operations from less critical to more critical, or implement a "journaling" or "intent" log for recovery, though this is complex.
*   **Error Handling in `Storable` Trait**: `Encode!` and `Decode!` can panic (e.g., if Candid encoding fails for some reason, though typically robust for well-defined types). While panics during writes are used as a strategy to halt operations and prevent partial writes *for that specific map entry*, they are the source of the atomicity issues noted above when multiple maps are involved.
*   **Circular Shelf References**: The check for circular shelf references (`ItemContent::Shelf`) in `shelf_storage.rs` (`Shelf::insert_item`) and `update/item.rs` (`add_item_to_shelf`) is one level deep when checking a nested shelf. It prevents direct `A->A` and simple `A->B->A` if `A` is added to `B` and `B` already contains `A`. However, more complex or deeper cycles (e.g., `A->B->C->A` where `A` is being added to `C`) might not be caught, potentially leading to issues during shelf resolution or display (infinite loops or excessive depth).
    *   **Recommendation**: Implement a more robust cycle detection algorithm if deep nesting is a common use case, possibly involving graph traversal logic during add operations, or limit nesting depth.

## Storage Structures (`src/perpetua/src/storage/`)

### `tag_storage.rs`

*   **Risk**: Inconsistency between `TAG_METADATA`, `TAG_SHELF_ASSOCIATIONS`, `SHELF_TAG_ASSOCIATIONS`, `TAG_POPULARITY_INDEX`, `TAG_LEXICAL_INDEX`, and `TAG_SHELF_CREATION_TIMELINE_INDEX`.
*   **Scenario**: If an operation that modifies these (e.g., adding/removing a tag from a shelf, handled in `update/tags.rs`) fails midway through updating these maps, they can become desynchronized. For instance, `TagMetadata.current_shelf_count` might not reflect the actual number of associations in `TAG_SHELF_ASSOCIATIONS`, or a tag might appear in one index but not another.

### `shelf_storage.rs`

*   **Risk**: Inconsistency between `SHELVES` (content) and `SHELF_METADATA`.
*   **Scenario**: Operations modifying a shelf must update both. Failure during such an update (e.g., metadata updated but content not, or vice-versa) leads to a corrupt shelf state.
*   **Risk**: `ShelfContent.items` and `ShelfContent.item_positions` (PositionTracker) desynchronization.
*   **Scenario**: If an operation incorrectly modifies one but not the other, the shelf's item list becomes corrupted. The `move_item` function has a diagnostic print for this, but it's a symptom of a pre-existing issue if it occurs.
*   **Risk**: `GLOBAL_TIMELINE` becoming inconsistent with actual shelf states.
*   **Scenario**: If shelf creation/update succeeds but updating its `GLOBAL_TIMELINE` entry fails, the timeline will be inaccurate.

### `nft_storage.rs`

*   **Risk**: `NFT_SHELVES` map becoming inconsistent with actual shelf content.
*   **Scenario**: If an NFT is added to/removed from a shelf in `SHELVES`, but the corresponding update to `NFT_SHELVES` fails, the record of which shelves contain a particular NFT will be wrong.

### `random_feed_storage.rs`

*   **Risk**: `RANDOM_SHELF_CANDIDATES` containing stale or dangling `ShelfId`s.
*   **Scenario**: If `refresh_random_shelf_candidates` fails or isn't run after shelves are deleted, the feed might propose non-existent shelves. A failure during the refresh (after clearing but before full repopulation) can lead to a temporarily empty or small feed.

### `user_storage.rs`

*   **Risk**: `USER_SHELVES` inconsistency with actual shelves or `SHELF_METADATA.owner`.
*   **Scenario**: If shelf creation/deletion succeeds but the update to `USER_SHELVES` for the owner fails, the user's list of their shelves will be wrong.
*   **Risk**: `USER_PROFILE_ORDER` containing dangling `ShelfId`s or being inconsistent with `USER_SHELVES`.
*   **Scenario**: If a shelf is deleted but not removed from `USER_PROFILE_ORDER`, or if `PositionTracker` operations within `UserProfileOrder` fail.

## Update Calls (`src/perpetua/src/update/`)

### `item.rs` (`add_item_to_shelf`, `remove_item_from_shelf`, `set_item_order`)

*   **Risk**: Partial updates leading to inconsistent state due to non-atomic operations across `SHELVES`, `SHELF_METADATA`, `NFT_SHELVES`, and nested shelf `appears_in` metadata.
*   **Scenario for `add_item_to_shelf`**:
    *   Parent shelf content (`SHELVES`) updated, but parent `SHELF_METADATA` update (e.g., `updated_at`) fails.
    *   Parent updated, but `NFT_SHELVES` update fails (NFT added to shelf, but not tracked in NFT's list of shelves).
    *   Parent updated, but updating `appears_in` list of a nested `ItemContent::Shelf` fails.
*   **Scenario for `remove_item_from_shelf`**:
    *   Item removed from parent shelf content/metadata, but cleanup of `NFT_SHELVES` or nested shelf `appears_in` fails.
    *   The logged `WARN` for "Inconsistent internal state for item" (if `items` and `item_positions` in `ShelfContent` are already out of sync) indicates a pre-existing corruption that this function might propagate or not fully resolve.
*   **Scenario for `set_item_order`**: Parent shelf content (positions) updated, but `SHELF_METADATA` (`updated_at`) update fails.

### `shelf.rs` (`store_shelf`, `update_shelf_metadata`)

*   **Risk for `store_shelf`**: High risk of inconsistent state due to the large number of stable maps updated sequentially (`SHELF_METADATA`, `SHELVES`, `NFT_SHELVES`, `USER_SHELVES`, `GLOBAL_TIMELINE`, plus multiple tag maps via `add_tag_to_metadata_maps`).
*   **Scenario**: Any panic/failure during the "COMMIT PHASE" can lead to partial creation. Examples:
    *   `SHELF_METADATA` written, but `SHELVES` (content) write fails -> metadata for a non-existent content.
    *   Shelf data written, but `NFT_SHELVES` update fails -> NFT items in shelf not correctly indexed.
    *   Shelf data written, but `USER_SHELVES` update fails -> user doesn't see their own shelf.
    *   Shelf data written, but `GLOBAL_TIMELINE` update fails -> shelf not discoverable in global feed.
    *   Shelf data written, but `add_tag_to_metadata_maps` (which itself updates many maps) fails -> shelf exists but tag associations are missing or incomplete.
*   **Issue**: `insert(...).is_some()` checks in `store_shelf`: If these occur (unexpected replacement of data), the function currently proceeds. This could mask underlying issues like `ShelfId` or timestamp collisions and should ideally cause a panic if uniqueness is a strict requirement.
*   **`update_shelf_metadata`**: Lower risk, primarily updates one entry in `SHELF_METADATA`. Atomicity is generally fine for its direct operation.

### `tags.rs` (`add_tag_to_shelf`, `remove_tag_from_shelf`, and helpers `add_tag_to_metadata_maps`, `remove_tag_from_metadata_maps`)

*   **Risk**: Very high risk of inconsistent tag indexes if helper functions (`add_tag_to_metadata_maps`, `remove_tag_from_metadata_maps`) fail/panic partway through their numerous map updates.
*   **Scenario**:
    *   Shelf metadata (its internal `tags` list) is updated by `auth::get_shelf_parts_for_edit_mut`, but the subsequent call to the helper (e.g., `add_tag_to_metadata_maps`) panics. The shelf object itself now lists a tag that is not (or only partially) indexed in the global tag maps.
    *   Within the helpers:
        *   `TAG_METADATA.current_shelf_count` updated, but `TAG_SHELF_ASSOCIATIONS` insert fails.
        *   `TAG_POPULARITY_INDEX` remove old count succeeds, but insert for new count fails.
        *   Any of the 5-6 map updates fails, leaving the others in a state that doesn't reflect the intended overall change.

### `access.rs` (`toggle_shelf_public_access`)

*   **Risk**: Inconsistency between `SHELF_METADATA.public_editing` and `GLOBAL_TIMELINE`'s copy of this flag.
*   **Scenario**: `SHELF_METADATA` is updated successfully, but the subsequent update to `GLOBAL_TIMELINE` fails. The shelf's actual edit status and its representation in the global feed will differ.
*   **Good Practice**: The consistency checks in Phase 1 (read/prepare) are good for detecting pre-existing issues before attempting an update.

### `follow.rs` (`follow_user`, `unfollow_user`, `follow_tag`, `unfollow_tag`)

*   **Risk**: Low. These functions modify a single entry (a set) within `FOLLOWED_USERS` or `FOLLOWED_TAGS`. The `StableBTreeMap::insert` of the modified set is atomic for that entry. A panic during `Encode!` of the set would abort the change for that specific follow/unfollow operation.
*   **Observation**: `follow_tag` doesn't check if the tag actually exists, only its format. Users can follow non-existent tags.

### `profile.rs` (`reorder_profile_shelf`, `reset_profile_order`)

*   **Risk**: Low. These functions modify a single `UserProfileOrder` entry in `USER_PROFILE_ORDER`. The `PositionTracker` logic is internal to this structure before it's written back. The main write is atomic for that user's profile order.
*   **Observation**: `reorder_profile_shelf` relies on `USER_SHELVES` to verify shelf ownership for reordering, but if a shelf ID exists in `USER_PROFILE_ORDER` but was deleted from `USER_SHELVES` (due to inconsistency elsewhere), this check might pass for the `shelf_id` being moved if it's still in the user's set by error, but the profile order could contain stale IDs.

This concludes the informal audit. The primary theme is the challenge of ensuring atomicity across multiple stable storage maps for complex operations.
