```
Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (475 lines)
│   │   │   ├── ContentDisplays.tsx (103 lines)
│   │   │   ├── NftDisplay.tsx (298 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (346 lines)
│   │   │   ├── ShelfCardActionMenu.tsx (225 lines)
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
│   ├── following/
│   │   ├── components/
│   │   │   ├── FollowedTagsList.tsx (112 lines)
│   │   │   └── FollowedUsersList.tsx (105 lines)
│   │   └── hooks/
│   │       └── useFollowStatus.ts (160 lines)
│   ├── items/
│   │   ├── components/
│   │   │   ├── AlexandrianSelector.tsx (84 lines)
│   │   │   └── InlineItemCreator.tsx (408 lines)
│   │   └── hooks/
│   │       └── useItemActions.tsx (112 lines)
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
│   │       │   └── useShelfReordering.ts (69 lines)
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
│   │       ├── useAddToShelf.ts (120 lines)
│   │       ├── usePublicShelfOperations.ts (62 lines)
│   │       └── useShelfOperations.ts (220 lines)
│   ├── shelf-settings/
│   │   ├── components/
│   │   │   ├── CollaboratorsTab.tsx (40 lines)
│   │   │   ├── GeneralSettingsTab.tsx (241 lines)
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
│       │   └── TagSearchBar.tsx (106 lines)
│       ├── containers/
│       │   └── FilteredShelfListContainer.tsx (111 lines)
│       ├── hooks/
│       │   ├── useTagActions.ts (51 lines)
│       │   └── useTagData.ts (37 lines)
│       └── index.ts (1 lines)
├── hooks/
│   └── useContentPermissions.ts (75 lines)
├── index.tsx (21 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (287 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (210 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (169 lines)
│   │   └── usePerpetuaSelectors.ts (62 lines)
│   ├── index.ts (46 lines)
│   ├── perpetuaSlice.ts (898 lines)
│   ├── services/
│   │   ├── followService.ts (276 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemService.ts (201 lines)
│   │   ├── serviceTypes.ts (39 lines)
│   │   ├── shelfService.ts (357 lines)
│   │   └── tagService.ts (306 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (110 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemThunks.ts (100 lines)
│   │   ├── queryThunks.ts (268 lines)
│   │   ├── reorderThunks.ts (128 lines)
│   │   ├── shelfThunks.ts (124 lines)
├── types/
│   ├── item.types.ts (27 lines)
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (74 lines)
└── utils.tsx (128 lines)
```


















Mainnet bug findings: 
- The "No tags" failure while not logged in is too agressive looking.
- Should be able to add an item to multiple shelves at once, not one at a time.
- We need loading indicators on the shelf pages when the images are taking time to load.
- I'm still somehow being logged out every 20 mintues. Wtf.
- Withdraw button is partially underneath the expander button.
- Also, the add to shelf modal needs a public section.
- There's no 'add-item' option on public shelves and should be.









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

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal h3aiz-rumwf-ycche-jdxcl-hkn22-2tyam-lzjgv-x7c3j-tbizn-tejua-hqe)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch c0ccbd75ca2cb2ce2dab10611df028a4f8e47d0a



