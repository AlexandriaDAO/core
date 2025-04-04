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

