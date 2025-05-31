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
│   │   │   ├── ShelfViewHeader.tsx (141 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useNftData.ts (156 lines)
│   │   └── utils/
│   │       ├── ShelfViewUtils.ts (32 lines)
│   │       └── itemUtils.ts (47 lines)
│   ├── following/
│   │   ├── components/
│   │   │   ├── FollowedTagsList.tsx (81 lines)
│   │   │   ├── FollowedUserBadge.tsx (56 lines)
│   │   │   └── FollowedUsersList.tsx (63 lines)
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
│   │   │   ├── InlineItemCreator.tsx (387 lines)
│   │   │   ├── NewShelf.tsx (154 lines)
│   │   │   ├── RemoveItemButton.tsx (98 lines)
│   │   │   ├── ShelfContent.tsx (90 lines)
│   │   │   ├── ShelfOption.tsx (31 lines)
│   │   │   └── ShelfSelectionDialog.tsx (796 lines)
│   │   ├── containers/
│   │   │   ├── ShelfDetailContainer.tsx (277 lines)
│   │   │   └── ShelfLists.tsx (268 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (180 lines)
│   │       ├── usePublicShelfOperations.ts (65 lines)
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
│       │   ├── PopularTagsList.tsx (94 lines)
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
│   └── PerpetuaLayout.tsx (500 lines)
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
│   │   ├── itemService.ts (215 lines)
│   │   ├── serviceTypes.ts (39 lines)
│   │   ├── shelfService.ts (387 lines)
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




- First next thing, get perpetua assets to load from trnasactionService like in ALexandian, and make alexandrian not freeze up being slow.




Experience:
- 'Explore' feed that:
  - Picks and shows an SBT
  - Has a 50% chance of triggering an if statement
    - If triggered
      - Show 1 of the shelves that NFT appears-in.
    - Else
      - Go to start.

How-to.


- To pick SBTs, use icrc7_scion canister. Then use icrc7_total_supply, pick an number with even randomness from 1-total_supply,  then use icrc7_tokens: (opt nat, opt nat) → (vec nat) query | Where the first parameter is the index and the second is the amount of results.
    - TokenAdapter.ts already implements these as utility functions.
- To figure out the NFT id from the SBT id use the backend function from nft_manager/src/id_converter.rs: scion_to_og_id(scion_id: Nat)
- To get the shelf







Functional:
- You should not be able to perform remove actions on public shelves.
- There's no optimistic addition of markdown items.
- The ICP/AR badge is not showing for ICP ones.
- There's a lot of background loading, like if I go to "My Library" it feels frozen for 10 seconds.
- Too much recursion and dialog opening errors.
- Progressive loading of NFTs inside shelves.
- Should reduce the delay for loading shelf paths that you click on.




Efficiency: 
- Are we able to not get the arweave metadata query before loading it from the asset canisters?




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

git show --patch add81056f2eaa8103b4def714be73e699121b9a4















I want to run an incentive program.

- Use the ALEX-core account.
- All the LBRY that people send there, we will match, and burn in small increments.
  - 10,000 BOB up for grabs. $5,000 rewards pool.
  - You'll get BOB in return

