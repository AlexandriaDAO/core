```

Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (448 lines)
│   │   │   ├── ContentDisplays.tsx (92 lines)
│   │   │   ├── NftDisplay.tsx (138 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (281 lines)
│   │   │   ├── ShelfContentCard.tsx (194 lines)
│   │   │   ├── ShelfContentModal.tsx (111 lines)
│   │   │   ├── ShelfDetailView.tsx (245 lines)
│   │   │   ├── ShelfEmptyView.tsx (32 lines)
│   │   │   ├── ShelfGridView.tsx (57 lines)
│   │   │   ├── ShelfViewControls.tsx (251 lines)
│   │   │   ├── ShelfViewHeader.tsx (101 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useNftData.ts (156 lines)
│   │   └── utils/
│   │       ├── ShelfViewUtils.ts (32 lines)
│   │       └── itemUtils.ts (47 lines)
│   ├── following/
│   │   ├── components/
│   │   │   ├── FollowedTagsList.tsx (93 lines)
│   │   │   ├── FollowedUserBadge.tsx (56 lines)
│   │   │   └── FollowedUsersList.tsx (80 lines)
│   │   └── hooks/
│   │       └── useFollowStatus.ts (193 lines)
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
│   │   │   ├── InlineItemCreator.tsx (350 lines)
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
│   └── PerpetuaLayout.tsx (437 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (210 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (123 lines)
│   │   └── usePerpetuaSelectors.ts (48 lines)
│   ├── index.ts (41 lines)
│   ├── perpetuaSlice.ts (983 lines)
│   ├── services/
│   │   ├── followService.ts (276 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemService.ts (209 lines)
│   │   ├── serviceTypes.ts (39 lines)
│   │   ├── shelfService.ts (332 lines)
│   │   └── tagService.ts (308 lines)
│   ├── thunks/
│   │   ├── followThunks.ts (91 lines)
│   │   ├── index.ts (6 lines)
│   │   ├── itemThunks.ts (117 lines)
│   │   ├── queryThunks.ts (326 lines)
│   │   ├── reorderThunks.ts (128 lines)
│   │   ├── shelfThunks.ts (125 lines)
├── types/
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (77 lines)
└── utils.tsx (128 lines)
Syllogos/
└── index.tsx (27 lines)


// perpetua/ backend.
perpetua/
├── Cargo.toml (23 lines)
├── perpetua.did (133 lines)
├── perpetua.md (207 lines)
├── scalability_report.md (180 lines)
└── src/
    ├── auth.rs (172 lines)
    ├── guard.rs (11 lines)
    ├── lib.rs (71 lines)
    ├── ordering.rs (542 lines)
    ├── query/
    │   ├── follows.rs (300 lines)
    │   └── shelves.rs (800 lines)
    ├── storage/
    │   ├── common_types.rs (5 lines)
    │   ├── follow_storage.rs (52 lines)
    │   ├── mod.rs (92 lines)
    │   ├── nft_storage.rs (32 lines)
    │   ├── random_feed_storage.rs (86 lines)
    │   ├── shelf_storage.rs (417 lines)
    │   ├── tag_storage.rs (161 lines)
    │   └── user_storage.rs (81 lines)
    ├── types.rs (86 lines)
    ├── update/
    │   ├── access.rs (104 lines)
    │   ├── debug.rs (10 lines)
    │   ├── follow.rs (131 lines)
    │   ├── item.rs (286 lines)
    │   ├── profile.rs (119 lines)
    │   ├── restore.rs (128 lines)
    │   ├── shelf.rs (170 lines)
    │   ├── tags.rs (184 lines)
    │   └── utils.rs (101 lines)
    └── utils.rs (33 lines)
```

















UI:
- There's a lot of background loading, like if I go to "My Library" it feels frozen for 10 seconds.
- Too much recursion and dialog opening errors.

Backend:
- Go through perpetua audit.
- Add payments for making shelves, and maybe elsewhere.

Functional:
- Progressive loading of NFTs inside shelves.


New Canister:
- Items on perpetua display load (need to maybe make the nft ranking setup.) Also at this point add the $ values to nfts with the rarity score.



V2:
- Animate the LBRY changes when doing stuff (and color it when the topup warning is present).
- We're going to need to be able to add an item in a certain spot. Not just the top/bottom. The backend already supports this, but you need to use another item to reference it which is a UX challenge. But if referencing a certain reference_item_id we could place before or after the add_item_to_shelf().












## Home feed attack plan.

- Make a 'feed' canister that tracks the NFTs, their ranks, and mixes them in with shelves.
- NFT's rating is based-on rarity %, which is just from #sbts created from it.


FEED Tab, so a 4th tab in the header:
- Select an NFT, psuedo-random but rarity weighted.
- For each nft there's a 60% chance we pick one of the shelves they appear in to show.

That's it.


Progress: So it gets all the nfts in one long call.

- but getting percentages in one long call is another story.

Plan:
    - For each SBT, add the like count to its original.
    - Maybe make this dynamic, so whenever coordinate mint is used, if it adds the new one. But first it needs to do all from scratch.


























## Helpful Commands

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal 2rffu-d2h7x-atqfv-7x4ab-ok7a7-e2o5r-ys3nc-po3xi-5tz6y-fngv7-5qe)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch c0ccbd75ca2cb2ce2dab10611df028a4f8e47d0a