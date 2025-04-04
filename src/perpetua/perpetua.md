Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (469 lines)
│   │   │   ├── ContentDisplays.tsx (120 lines)
│   │   │   ├── NftDisplay.tsx (350 lines)
│   │   │   ├── ShelfBlogView.tsx (132 lines)
│   │   │   ├── ShelfCard.tsx (155 lines)
│   │   │   ├── ShelfCardActionMenu.tsx (173 lines)
│   │   │   ├── ShelfContentCard.tsx (160 lines)
│   │   │   ├── ShelfContentModal.tsx (97 lines)
│   │   │   ├── ShelfDetailView.tsx (271 lines)
│   │   │   ├── ShelfEmptyView.tsx (38 lines)
│   │   │   ├── ShelfGridView.tsx (57 lines)
│   │   │   ├── ShelfViewControls.tsx (129 lines)
│   │   │   ├── ShelfViewHeader.tsx (93 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── containers/
│   │   │   ├── ShelfLists.tsx (256 lines)
│   │   │   └── index.ts (1 lines)
│   │   ├── index.ts (7 lines)
│   │   └── utils/
│   │       └── ShelfViewUtils.ts (44 lines)
│   ├── items/
│   │   ├── components/
│   │   │   ├── ItemActionMenu.tsx (61 lines)
│   │   │   ├── NewItem.tsx (391 lines)
│   │   │   ├── NftSearch.tsx (321 lines)
│   │   │   └── index.ts (5 lines)
│   │   ├── hooks/
│   │   │   └── useItemActions.tsx (116 lines)
│   │   └── index.ts (2 lines)
│   ├── shared/
│   │   └── reordering/
│   │       ├── components/
│   │       │   ├── ItemReorderManager.tsx (45 lines)
│   │       │   ├── ReorderableGrid.tsx (88 lines)
│   │       │   └── ReorderableList.tsx (74 lines)
│   │       ├── hooks/
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
│   │   │   ├── NewShelf.tsx (97 lines)
│   │   │   ├── RemoveItemButton.tsx (110 lines)
│   │   │   ├── ShelfContent.tsx (80 lines)
│   │   │   ├── ShelfOption.tsx (30 lines)
│   │   │   └── ShelfSelectionDialog.tsx (134 lines)
│   │   ├── containers/
│   │   │   └── ShelfDetailContainer.tsx (162 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (118 lines)
│   │       ├── usePublicShelfOperations.ts (61 lines)
│   │       └── useShelfOperations.ts (220 lines)
│   └── shelf-settings/
│       ├── components/
│       │   ├── ShelfMetricsDisplay.tsx (143 lines)
│       │   ├── ShelfSettings.tsx (120 lines)
│       │   ├── ShelfSettingsDialog.tsx (132 lines)
│       │   └── index.ts (3 lines)
│       ├── hooks/
│       │   ├── index.ts (2 lines)
│       │   ├── useShelfMetadata.ts (34 lines)
│       │   └── useShelfMetrics.ts (40 lines)
│       ├── index.ts (3 lines)
│       └── utils/
│           └── index.ts (2 lines)
├── hooks/
│   └── useContentPermissions.ts (75 lines)
├── index.tsx (17 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (215 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (209 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (147 lines)
│   │   └── usePerpetuaSelectors.ts (62 lines)
│   ├── index.ts (49 lines)
│   ├── perpetuaSlice.ts (645 lines)
│   ├── services/
│   │   └── perpetuaService.ts (527 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (106 lines)
│   │   ├── index.ts (6 lines)
│   │   ├── itemThunks.ts (92 lines)
│   │   ├── queryThunks.ts (151 lines)
│   │   ├── reorderThunks.ts (117 lines)
│   │   └── shelfThunks.ts (152 lines)
│   ├── utils/
├── types/
│   ├── item.types.ts (27 lines)
│   ├── reordering.types.ts (68 lines)
│   └── shelf.types.ts (74 lines)
└── utils.tsx (136 lines)
























## V1 Features

- Add appears-in in the frontend.
- Add tags to the frontend.
- Add number of items as a shelf details.
 
- Payment for all/some actions.
- Test edit stuff.

- Backup system for all data.

## V2 Features: 

- A preview of the slots in the profile. (Could be done later)











#[Using Modules] 

- SearchContainer Component - Powerful for when we start adding filters to the explore page.
- TopupBalanceWarning Component - If Perpetua has any operations that require tokens, this could be reused.








# Backend ToDos:
- Make sure add_item_to_shelf has the proper type checks. Right now, I just use the frontend to determine if it's 'shelf', 'nft' or 'markdown'.





## Cleanup commands. 


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json



dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

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

