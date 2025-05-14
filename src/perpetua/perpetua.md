```
// Perpetua/ Frontend

Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (448 lines)
│   │   │   ├── ContentDisplays.tsx (92 lines)
│   │   │   ├── NftDisplay.tsx (152 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (315 lines)
│   │   │   ├── ShelfContentCard.tsx (190 lines)
│   │   │   ├── ShelfContentModal.tsx (79 lines)
│   │   │   ├── ShelfDetailView.tsx (233 lines)
│   │   │   ├── ShelfEmptyView.tsx (32 lines)
│   │   │   ├── ShelfGridView.tsx (57 lines)
│   │   │   ├── ShelfViewControls.tsx (251 lines)
│   │   │   ├── ShelfViewHeader.tsx (101 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useNftData.ts (156 lines)
│   │   └── utils/
│   │       └── ShelfViewUtils.ts (32 lines)
│   ├── following/
│   │   ├── components/
│   │   │   ├── FollowedTagsList.tsx (102 lines)
│   │   │   ├── FollowedUserBadge.tsx (56 lines)
│   │   │   └── FollowedUsersList.tsx (77 lines)
│   │   └── hooks/
│   │       └── useFollowStatus.ts (160 lines)
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
│   │       │   ├── useItemReordering.ts (90 lines)
│   │       │   ├── useReorderable.ts (142 lines)
│   │       │   └── useShelfReordering.ts (69 lines)
│   │       └── utils/
│   │           ├── createReorderAdapter.ts (59 lines)
│   │           └── reorderUtils.ts (32 lines)
│   ├── shelf-information/
│   │   └── components/
│   │       └── ShelfInformationDialog.tsx (144 lines)
│   ├── shelf-management/
│   │   ├── components/
│   │   │   ├── InlineItemCreator.tsx (347 lines)
│   │   │   ├── NewShelf.tsx (154 lines)
│   │   │   ├── RemoveItemButton.tsx (98 lines)
│   │   │   ├── ShelfContent.tsx (90 lines)
│   │   │   ├── ShelfOption.tsx (31 lines)
│   │   │   └── ShelfSelectionDialog.tsx (564 lines)
│   │   ├── containers/
│   │   │   ├── ShelfDetailContainer.tsx (277 lines)
│   │   │   └── ShelfLists.tsx (264 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (148 lines)
│   │       ├── usePublicShelfOperations.ts (62 lines)
│   │       └── useShelfOperations.ts (205 lines)
│   ├── shelf-settings/
│   │   ├── components/
│   │   │   ├── GeneralSettingsTab.tsx (241 lines)
│   │   │   ├── PublicAccessSection.tsx (70 lines)
│   │   │   ├── ShelfInformationSection.tsx (117 lines)
│   │   │   ├── ShelfLinkItem.tsx (34 lines)
│   │   │   ├── ShelfSettingsDialog.tsx (96 lines)
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
│       │   └── FilteredShelfListContainer.tsx (113 lines)
│       ├── hooks/
│       │   ├── useTagActions.ts (51 lines)
│       │   └── useTagData.ts (37 lines)
│       └── index.ts (1 lines)
├── hooks/
│   └── useContentPermissions.ts (66 lines)
├── index.tsx (21 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (321 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (210 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (123 lines)
│   │   └── usePerpetuaSelectors.ts (48 lines)
│   ├── index.ts (41 lines)
│   ├── perpetuaSlice.ts (817 lines)
│   ├── services/
│   │   ├── followService.ts (276 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemService.ts (209 lines)
│   │   ├── serviceTypes.ts (39 lines)
│   │   ├── shelfService.ts (260 lines)
│   │   └── tagService.ts (306 lines)
│   ├── thunks/
│   │   ├── index.ts (6 lines)
│   │   ├── itemThunks.ts (117 lines)
│   │   ├── queryThunks.ts (268 lines)
│   │   ├── reorderThunks.ts (128 lines)
│   │   ├── shelfThunks.ts (125 lines)
├── types/
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (77 lines)
└── utils.tsx (128 lines)


// perpetua/ backend.
perpetua/
├── Cargo.toml (20 lines)
├── perpetua.did (151 lines)
├── perpetua.md (273 lines)
└── src/
    ├── auth.rs (169 lines)
    ├── guard.rs (11 lines)
    ├── lib.rs (82 lines)
    ├── ordering.rs (542 lines)
    ├── query/
    │   ├── backups.rs (129 lines)
    │   ├── follows.rs (280 lines)
    │   └── shelves.rs (618 lines)
    ├── storage.rs (692 lines)
    ├── types.rs (86 lines)
    ├── update/
    │   ├── access.rs (34 lines)
    │   ├── follow.rs (132 lines)
    │   ├── item.rs (335 lines)
    │   ├── profile.rs (119 lines)
    │   ├── restore.rs (128 lines)
    │   ├── shelf.rs (126 lines)
    │   ├── tags.rs (324 lines)
    │   └── utils.rs (101 lines)
    └── utils.rs (33 lines)
```










- Probably next step is to make the display with the leading NFTs, and the hover with what's inside.




















## Helpful Commands

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal qfjpl-beqtj-w4vfq-kbi42-cajph-nkqod-odqoo-akdw4-yji3u-irw6u-gqe)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch c0ccbd75ca2cb2ce2dab10611df028a4f8e47d0a