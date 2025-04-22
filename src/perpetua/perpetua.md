```
Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (410 lines)
│   │   │   ├── ContentDisplays.tsx (103 lines)
│   │   │   ├── NftDisplay.tsx (298 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (286 lines)
│   │   │   ├── ShelfCardActionMenu.tsx (159 lines)
│   │   │   ├── ShelfContentCard.tsx (135 lines)
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
│   │   │   ├── AlexandrianSelector.tsx (84 lines)
│   │   │   ├── InlineItemCreator.tsx (405 lines)
│   │   │   └── index.ts (5 lines)
│   │   ├── hooks/
│   │   │   └── useItemActions.tsx (112 lines)
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
│   │       │   ├── useDragAndDrop.ts (111 lines)
│   │       │   ├── useItemReordering.ts (77 lines)
│   │       │   ├── useReorderable.ts (142 lines)
│   │       │   └── useShelfReordering.ts (70 lines)
│   │       └── utils/
│   │           ├── createReorderAdapter.ts (59 lines)
│   │           └── reorderUtils.ts (32 lines)
│   ├── shelf-collaboration/
│   │   └── components/
│   │       └── CollaboratorsList.tsx (186 lines)
│   ├── shelf-management/
│   │   ├── components/
│   │   │   ├── NewShelf.tsx (104 lines)
│   │   │   ├── RemoveItemButton.tsx (98 lines)
│   │   │   ├── ShelfContent.tsx (80 lines)
│   │   │   ├── ShelfOption.tsx (31 lines)
│   │   │   └── ShelfSelectionDialog.tsx (158 lines)
│   │   ├── containers/
│   │   │   ├── ShelfDetailContainer.tsx (161 lines)
│   │   │   └── ShelfLists.tsx (248 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (128 lines)
│   │       ├── usePublicShelfOperations.ts (62 lines)
│   │       └── useShelfOperations.ts (211 lines)
│   ├── shelf-settings/
│   │   ├── components/
│   │   │   ├── CollaboratorsTab.tsx (40 lines)
│   │   │   ├── GeneralSettingsTab.tsx (238 lines)
│   │   │   ├── PublicAccessSection.tsx (70 lines)
│   │   │   ├── ShelfInformationSection.tsx (132 lines)
│   │   │   ├── ShelfLinkItem.tsx (32 lines)
│   │   │   ├── ShelfSettingsDialog.tsx (119 lines)
│   │   │   ├── TagsSection.tsx (132 lines)
│   │   │   └── index.ts (6 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useShelfMetrics.ts (38 lines)
│   │   ├── index.ts (2 lines)
│   │   ├── types.ts (63 lines)
│   │   └── utils/
│   │       └── tagValidation.ts (47 lines)
│   └── tags/
│       ├── components/
│       │   ├── PopularTagsList.tsx (93 lines)
│       │   ├── TagFilterDisplay.tsx (38 lines)
│       │   └── TagSearchBar.tsx (98 lines)
│       ├── containers/
│       │   └── FilteredShelfListContainer.tsx (88 lines)
│       ├── hooks/
│       │   ├── useTagActions.ts (40 lines)
│       │   └── useTagData.ts (37 lines)
│       └── index.ts (1 lines)
├── hooks/
│   └── useContentPermissions.ts (75 lines)
├── index.tsx (22 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (260 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (210 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (163 lines)
│   │   └── usePerpetuaSelectors.ts (62 lines)
│   ├── index.ts (49 lines)
│   ├── perpetuaSlice.ts (957 lines)
│   ├── services/
│   │   └── perpetuaService.ts (685 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (106 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemThunks.ts (97 lines)
│   │   ├── queryThunks.ts (288 lines)
│   │   ├── reorderThunks.ts (119 lines)
│   │   ├── shelfThunks.ts (120 lines)
├── types/
│   ├── item.types.ts (27 lines)
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (74 lines)
└── utils.tsx (128 lines)
```






- People/follow tags work functinoally now. Now we make them usable on many levels.

(1) Tag follow toasts don't actually show.
(2) 


Minor Frontend Stuff:
- Enforce 100 char title, 500 char description.
- Shelves actually have a 10 tag max in the backend. Should we change this? (and 50 chars)
- Max 500 items per shelf.
- 10k markdown chars.
- In storage.rs there's a check that won't let you add a shelf to a shelf that already has that shelf. Need to make sure that operation is clear to the user when attempted and fails.



Backend Stuff:
- Payment for all/some actions
  - Pay for shelf creation after the fifth shelf. That's it (for now).
- Download personal data as a csv.
  - This way we could use this function to do it manually at various times.
- Feed: 'Following' with your feed being the latest of those you're following? Could we make a query function for that?




 


## V2 Features (Separate Canister):
- More advanced search engine for the setup. So separate architecture with backups (maybe centralized).
- A preview of the slots in the profile. (Could be done later)













## Helpful Commands

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal gcuqr-i2pze-jo24s-lgaj2-bewrz-b23sk-nijk6-vqmlx-b46q3-msxsi-oqe)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch 3600406077dace006a518893b41666a2ab535195










# Backend ToDos

## Security and Vulnerability Suggestions

1. **Add a mechanism for shelf data backup and recovery**
   - Provide a way to export and import shelf data for disaster recovery.

## Performance Optimizations

1. **Review position rebalancing thresholds**
   - Current thresholds may trigger rebalancing too frequently with large shelves.

2. **Optimize ordering operations for large collections**
   - The ordering logic may be inefficient for shelves with hundreds of items.












# Required Tests
f
- Do thousands of shelf and item reorderings and see what the limits are at.












































