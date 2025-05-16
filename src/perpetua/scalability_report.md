### Perpetua Canister Scalability Report (Simplified Storage/Compute Focus)

## Update Functions

**`store_shelf(title, description, items, tags)`**
*   Avg Storage Added: ~2KB - 4KB (small shelf, few items/tags). Stored across two maps now (`SHELF_METADATA` for metadata, `SHELVES` for content).
*   Max Storage Added: ~500KB - 600KB (shelf with 500 items, each with 1KB markdown). Stored across two maps.
*   Additional Impact: Adds an entry to `USER_SHELVES` for the caller. The number of shelves a user can own is capped at `MAX_USER_SHELVES` (currently 1000). The `TimestampedShelves` BTreeSet for the user grows, but its size is bounded.
*   Failure Scenarios: Hits `MAX_USER_SHELVES` limit. Standard large shelf storage/compute concerns, though data is now split.

**`add_item_to_shelf(shelf_id, input)`**
*   Avg Storage Added: ~50-150 bytes added to the `ShelfContent` object (rewrites entire `ShelfContent`). `ShelfMetadata.updated_at` is also updated.
*   Max Storage Added: ~1KB added to the `ShelfContent` object (rewrites entire `ShelfContent`). Storage-heavy if `ShelfContent` is large. `ShelfMetadata.updated_at` is also updated.

**`remove_item_from_shelf(shelf_id, item_id)`**
*   Avg Storage Removed: ~50-150 bytes from `ShelfContent` object (rewrites entire `ShelfContent`). `ShelfMetadata.updated_at` is also updated.
*   Max Storage Removed: ~1KB from `ShelfContent` object (rewrites entire `ShelfContent`). Improves storage. `ShelfMetadata.updated_at` is also updated.

**`add_tag_to_shelf(input)`**
*   Avg Storage Added: ~200-350 bytes across tag maps + `ShelfMetadata` object rewrite (to update its internal tags list and `updated_at`). `ShelfContent` is not rewritten.
*   Max Storage Added: ~350 bytes + `ShelfMetadata` object rewrite. Low impact per call. `ShelfContent` is not rewritten.

**`remove_tag_from_shelf(input)`**
*   Avg Storage Removed: ~200-350 bytes across tag maps + `ShelfMetadata` object rewrite (to update its internal tags list and `updated_at`). `ShelfContent` is not rewritten.
*   Max Storage Removed: ~350 bytes + `ShelfMetadata` object rewrite. Improves storage. `ShelfContent` is not rewritten.

**`update_shelf_metadata(shelf_id, title, description)`**
*   Avg Storage Change: Variable, up to ~600 bytes added/removed based on text length changes (rewrites `ShelfMetadata`). **`ShelfContent` (item data) is not affected or rewritten.**
*   Max Storage Change: ~600 bytes added/removed (rewrites `ShelfMetadata`). Low impact. **`ShelfContent` (item data) is not affected or rewritten.**

**`toggle_shelf_public_access(shelf_id, public)`**
*   Avg Storage Change: Negligible (boolean flip, rewrites `ShelfMetadata`). **`ShelfContent` (item data) is not affected or rewritten.**
*   Max Storage Change: Negligible. Very low impact. **`ShelfContent` (item data) is not affected or rewritten.**

**`set_item_order(shelf_id, item_ids)`**
*   Avg Compute: Moderate cost to update `PositionTracker` within `ShelfContent` and rewrite `ShelfContent`. `ShelfMetadata.updated_at` is also updated.
*   Max Compute: High cost if reordering many items (e.g., 500) + cost of rewriting a potentially large `ShelfContent` object. Compute-heavy. `ShelfMetadata.updated_at` is also updated.

**`reorder_profile_shelf(shelf_id, reference_shelf_id, before)`**
*   Avg Storage Change: Rewrites `UserProfileOrder` (~50-60 bytes per ordered shelf).
*   Max Storage Change: Moderate if user has thousands of ordered shelves (e.g., 1k shelves -> ~50-60KB rewrite).

**`reset_profile_order()`**
*   Avg Storage Change: Rewrites `UserProfileOrder`.
*   Max Storage Change: Similar to `reorder_profile_shelf`.

**`follow_user(principal_to_follow)`**
*   Max Storage Impact: `PrincipalSet` capped at `MAX_FOLLOWED_USERS` (now 100). Rewrite cost bounded (e.g., for 100 principals, roughly 3-4KB).

**`unfollow_user(principal_to_unfollow)`**
*   Max Storage Impact: `PrincipalSet` capped at `MAX_FOLLOWED_USERS` (now 100).

**`follow_tag(tag_to_follow)`**
*   Max Storage Impact: `NormalizedTagSet` capped at `MAX_FOLLOWED_TAGS` (now 100). Max size roughly `100 * (25 bytes + overhead)`, around 3-4KB.

**`unfollow_tag(tag_to_unfollow)`**
*   Max Storage Impact: `NormalizedTagSet` capped at `MAX_FOLLOWED_TAGS` (now 100).

---

**Key Concerns (Simplified):**
*   **Large `ShelfContent` Rewrites:** Operations modifying items or their order within a shelf require rewriting the entire `ShelfContent` object. This is costly if `ShelfContent` has many items (e.g., max 500 items), but the cost is now isolated to content and does not include metadata.
    *   **Potential Failure Scenario:** If a `ShelfContent` object is very large (e.g., 500 items with substantial individual data), any operation like adding, removing, or reordering items could hit instruction limits for the update call due to the cost of deserializing, modifying (including complex `PositionTracker` updates for many items), and serializing the entire large `ShelfContent`.
*   **Full Iteration:** ~~`debug_trigger_refresh_random_candidates` iterating all shelves (metadata or content) is not scalable.~~
    *   **Potential Failure Scenario:** ~~If the canister stores millions of shelves, iterating through all shelf IDs (from `SHELF_METADATA` or `SHELVES` keys) to perform reservoir sampling will consume a massive number of instructions, likely exceeding the per-call limit and trapping the canister. This makes the feature unusable at scale.~~


## Query Functions

**`get_my_followed_tags() -> Vec<String>`**
*   Scalability: Excellent. Cap `MAX_FOLLOWED_TAGS` (100) prevents unbounded growth and makes data size small.

**`get_my_followed_users() -> Vec<Principal>`**
*   Scalability: Excellent. Cap `MAX_FOLLOWED_USERS` (100) prevents unbounded growth and makes data size small.

**`get_shelf(shelf_id: String) -> ShelfPublic`**
*   Data Structures Used: `SHELF_METADATA (ShelfId -> ShelfMetadata)`, `SHELVES (ShelfId -> ShelfContent)`
*   Scalability: Scales with individual shelf metadata and content size. Two separate deserializations (one for `ShelfMetadata`, one for `ShelfContent`). This is an improvement over deserializing a larger, single composite object.

**`get_recent_shelves(cursor: Option<u64>, limit: u64) -> Page<ShelfPublic>`**
*   Scalability: Cost per page is `L * (avg_metadata_load_cost + avg_content_load_cost)`. Loading metadata and content separately is more granular.

**`get_user_shelves(principal: Principal, offset: u64, limit: u64) -> Page<ShelfPublic>`**
*   Scalability: Cap on user shelves (1000) makes `TimestampedShelves` load predictable. Offset pagination for deep pages is inefficient. Each shelf requires loading metadata and content separately.

**`get_shelves_by_tag(tag: String, cursor: Option<TagShelfCreationTimelineKey>, limit: u64) -> Page<ShelfPublic>`**
*   Scalability: Good for index lookup. Overall scalability per page limited by loading `L` full shelf metadata and content objects separately.

**`get_public_shelves_by_tag(tag: String) -> Vec<ShelfPublic>` (No pagination in DID)**
*   Scalability: Poor if a tag is very popular and associated shelves are numerous/large. **Concern.** Requires loading metadata and content for each shelf.

**`get_popular_tags(cursor: Option<(u64, String)>, limit: u64) -> Page<String>`**
*   Scalability: Excellent.

**`get_tags_with_prefix(prefix: String, cursor: Option<String>, limit: u64) -> Page<String>`**
*   Scalability: Excellent.

**`get_shuffled_by_hour_feed(limit_input: u64) -> Vec<ShelfPublic>`**
*   Data Structures Used: `GLOBAL_TIMELINE`, `SHELF_METADATA`, `SHELVES`
*   Logic Summary: Fetches the latest `RANDOM_FEED_WINDOW_SIZE` (e.g., 200) shelf IDs from `GLOBAL_TIMELINE`. For each, loads `ShelfMetadata` and `ShelfContent`. Shuffles this list using an hourly deterministic seed and returns the top `limit_input` shelves. All shelves are considered, `public_editing` flag is not used for filtering this feed.
*   Avg Compute & Time: Moderate. Involves iterating up to `RANDOM_FEED_WINDOW_SIZE` items from the timeline, `2 * RANDOM_FEED_WINDOW_SIZE` map lookups (metadata and content), and shuffling. The cost is bounded by `RANDOM_FEED_WINDOW_SIZE`.
*   Max Compute & Time: Same as average, as operations are on a fixed-size window.
*   Scalability: Good. Performance is independent of the total number of shelves in the canister, depending only on `RANDOM_FEED_WINDOW_SIZE` and `limit_input`.
*   Failure Scenarios: Low. If `GLOBAL_TIMELINE` is empty or has fewer items than requested, it will return fewer items or an empty list, which is gracefully handled.

**`get_shelf_items(shelf_id: String, cursor: Option<u32>, limit: u64) -> Page<Item>`**
*   Scalability: **Addressed/Improved.** Loads only `ShelfContent`, avoiding metadata deserialization if only items are needed.

**`get_shelves_containing_nft(nft_id: String) -> Vec<String>`**
*   Scalability: Good if `MAX_APPEARS_IN_COUNT` (100) is effective.

**`is_shelf_public(shelf_id: String) -> Bool`**
*   Scalability: **Addressed/Improved.** Loads only `ShelfMetadata`, avoiding content deserialization.

**`get_tag_shelf_count(tag: String) -> u64`**
*   Scalability: Excellent.

**`get_shelf_position_metrics(shelf_id: String) -> ShelfPositionMetrics`**
*   Scalability: **Addressed/Improved.** Loads only `ShelfContent`, avoiding metadata deserialization.

**`get_followed_tags_feed(cursor: Option<u64>, limit: u64) -> Page<ShelfPublic>`**
*   Logic Summary: Aggregates shelves from followed tags. Max 100 followed tags. For each, fetches metadata and content separately.
*   Avg Compute & Time (per page `L`): Moderate to High. Up to 100 source queries + merge + `L` separate metadata & content loads.
*   Max Compute & Time: High if user follows many (e.g., 100) active tags.
*   Scalability: Significantly improved with cap at 100. Merging 100 sources is much more manageable. **Concern Largely Mitigated.**
*   Failure Scenarios: Low risk of instruction exhaustion with the reduced cap.

**`get_followed_users_feed(cursor: Option<u64>, limit: u64) -> Page<ShelfPublic>`**
*   Logic Summary: Aggregates shelves from followed users. Max 100 followed users. For each, fetches metadata and content separately.
*   Avg Compute & Time (per page `L`): Moderate to High. Up to 100 source queries + merge + `L` separate metadata & content loads.
*   Max Compute & Time: High if user follows many (e.g., 100) active users.
*   Scalability: Significantly improved with cap at 100. Merging 100 sources is much more manageable. **Concern Largely Mitigated.**
*   Failure Scenarios: Low risk of instruction exhaustion with the reduced cap.

**`get_storyline_feed(cursor: Option<u64>, limit: u64) -> Page<ShelfPublic>`**
*   Logic Summary: Variable. Combines followed users (max 100) and tags (max 100) feeds. Max ~200 effective sources. Each shelf requires loading metadata and content separately.
*   Scalability: Significantly improved. Total sources to consider are capped at a much lower number. **Concern Largely Mitigated.**
*   Failure Scenarios: Low risk of instruction exhaustion with the reduced caps.

---

**Key Concerns (Query Functions):**

1.  **Full Shelf Deserialization for Partial Data:**
    *   **Status:** **Significantly Improved / Addressed for specific cases.**
    *   **Current State:** `is_shelf_public` now only loads `ShelfMetadata`. `get_shelf_items` and `get_shelf_position_metrics` now only load `ShelfContent`. This avoids loading unnecessary data for these specific queries. Functions returning the full `ShelfPublic` DTO now perform two more granular deserializations (`ShelfMetadata` and `ShelfContent`) instead of one large one, which is a structural improvement.
    *   **Potential Failure Scenario (Remaining Aspect):** For queries designed to return a full `ShelfPublic` object, if a shelf's `ShelfContent` is exceptionally large (e.g., 500 items with very verbose descriptions), the deserialization of this `ShelfContent` could still be a performance bottleneck for that query or, in extreme cases, approach instruction limits for that single call. The primary concern of loading *unnecessary data* is resolved; this relates to loading *necessary but very large* data.
    *   **Recommendation:** Leverage separation by creating endpoints returning only `ShelfMetadata` or paginated `ShelfContent` for list views.

2.  **Large Collection Deserialization (for User Shelves Initial Load):**
    *   **Functions Affected:** `get_user_shelves`.
    *   **Concern:** Loading `TimestampedShelves` (capped at 1000 user-owned shelves) for offset pagination can be an upfront cost.
    *   **Potential Failure Scenario:** For a user at or near the `MAX_USER_SHELVES` limit (1000), the initial deserialization of their `TimestampedShelves` (1000 `(u64, ShelfId)` tuples) and `UserProfileOrder` can consume a significant number of instructions. This might not cause a trap but could result in noticeable latency for the first page retrieval of that user's shelf list, impacting user experience.
    *   **Recommendation:** Cap makes it manageable. True cursor-based pagination on underlying `USER_SHELVES` data ideal for deep pagination.

3.  **Scatter-Gather Pattern for Feeds (even with caps):**
    *   **Status:** **Largely Mitigated.**
    *   **Functions Affected:** `get_followed_tags_feed`, `get_followed_users_feed`, `get_storyline_feed`.
    *   **Concern:** Reduced caps (`MAX_FOLLOWED_TAGS` and `MAX_FOLLOWED_USERS` to 100) make merging sources much more manageable and significantly reduce the risk of instruction exhaustion.
    *   **Potential Failure Scenario:** For a user following the maximum number of very active entities (e.g., 100 active users or 100 tags that appear on many new shelves frequently), the internal logic to fetch recent items from all these sources and then merge/rank them to produce the final paginated feed can still be computationally intensive. While less likely to trap, it could lead to slower feed generation times for these highly-connected users.
    *   **Recommendation:** Monitor performance under load. If issues arise with 100 sources, further optimization (like paginating sources or partial loads) could be revisited, but it's no longer a critical/major concern.

4.  **Offset Pagination Inefficiency (for `get_user_shelves`):**
    *   **Functions Affected:** `get_user_shelves`.
    *   **Concern:** After loading the (capped) `TimestampedShelves`, iterating for an offset is inefficient for deep pages.
    *   **Potential Failure Scenario:** When a user with many shelves (e.g., 1000) requests a deep page (e.g., page 40 of 50, offset 780), the backend still deserializes the entire list of 1000 shelf IDs and their timestamps/order, then internally skips 780 of them. This leads to progressively slower response times for deeper pages as the wasted computation increases, negatively impacting UX for browsing far into large collections.
    *   **Recommendation:** Primary hit is initial load. Less critical than other prior issues.

5 **`get_public_shelves_by_tag` Scalability:**
    *   **Function Affected:** `get_public_shelves_by_tag`.
    *   **Concern:** Still loads `ShelfMetadata` for all matching shelves, then potentially `ShelfContent`. Popular tags can still be an issue.
    *   **Potential Failure Scenario:** If a tag is extremely popular (e.g., associated with 10,000+ shelves), this unpaginated query will attempt to load metadata for all of them, then content for all public ones, and assemble a potentially huge `Vec<ShelfPublic>`. This will almost certainly exceed canister instruction limits, causing the call to trap and making the endpoint unusable for such popular tags.
    *   **Recommendation:** Consider pagination for this query. **Actionable if observed to be an issue.**

