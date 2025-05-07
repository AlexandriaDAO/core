```
Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (490 lines)
│   │   │   ├── ContentDisplays.tsx (92 lines)
│   │   │   ├── NftDisplay.tsx (152 lines)
│   │   │   ├── ShelfBlogView.tsx (191 lines)
│   │   │   ├── ShelfCard.tsx (348 lines)
│   │   │   ├── ShelfContentCard.tsx (174 lines)
│   │   │   ├── ShelfContentModal.tsx (79 lines)
│   │   │   ├── ShelfDetailView.tsx (229 lines)
│   │   │   ├── ShelfEmptyView.tsx (32 lines)
│   │   │   ├── ShelfGridView.tsx (57 lines)
│   │   │   ├── ShelfViewControls.tsx (239 lines)
│   │   │   ├── ShelfViewHeader.tsx (92 lines)
│   │   │   └── index.ts (9 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (1 lines)
│   │   │   └── useNftData.ts (156 lines)
│   │   └── utils/
│   │       └── ShelfViewUtils.ts (32 lines)
│   ├── following/
│   │   ├── components/
│   │   │   ├── FollowedTagsList.tsx (102 lines)
│   │   │   └── FollowedUsersList.tsx (94 lines)
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
│   ├── shelf-collaboration/
│   │   └── components/
│   │       └── CollaboratorsList.tsx (186 lines)
│   ├── shelf-management/
│   │   ├── components/
│   │   │   ├── NewShelf.tsx (154 lines)
│   │   │   ├── RemoveItemButton.tsx (98 lines)
│   │   │   ├── ShelfContent.tsx (90 lines)
│   │   │   ├── ShelfOption.tsx (31 lines)
│   │   │   └── ShelfSelectionDialog.tsx (328 lines)
│   │   ├── containers/
│   │   │   ├── ShelfDetailContainer.tsx (168 lines)
│   │   │   └── ShelfLists.tsx (251 lines)
│   │   └── hooks/
│   │       ├── index.ts (4 lines)
│   │       ├── useAddToShelf.ts (120 lines)
│   │       ├── usePublicShelfOperations.ts (62 lines)
│   │       └── useShelfOperations.ts (231 lines)
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
│       │   └── FilteredShelfListContainer.tsx (113 lines)
│       ├── hooks/
│       │   ├── useTagActions.ts (51 lines)
│       │   └── useTagData.ts (37 lines)
│       └── index.ts (1 lines)
├── hooks/
│   └── useContentPermissions.ts (74 lines)
├── index.tsx (21 lines)
├── layouts/
│   └── PerpetuaLayout.tsx (292 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (210 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (169 lines)
│   │   └── usePerpetuaSelectors.ts (59 lines)
│   ├── index.ts (46 lines)
│   ├── perpetuaSlice.ts (937 lines)
│   ├── services/
│   │   ├── followService.ts (276 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemService.ts (209 lines)
│   │   ├── serviceTypes.ts (39 lines)
│   │   ├── shelfService.ts (357 lines)
│   │   └── tagService.ts (306 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (110 lines)
│   │   ├── index.ts (7 lines)
│   │   ├── itemThunks.ts (117 lines)
│   │   ├── queryThunks.ts (268 lines)
│   │   ├── reorderThunks.ts (128 lines)
│   │   ├── shelfThunks.ts (125 lines)
├── types/
│   ├── reordering.types.ts (69 lines)
│   └── shelf.types.ts (74 lines)
└── utils.tsx (128 lines)
```









- Need to really rethink the way we use following.
  - It shouldn't attempt to fetch if not logged in.
  - We shouldn't have to wait for it to finish to see other stuff.
  - It doesn't need to be in your face.

- Random vs. Latest feed on initial load.
- Popular tags display proportional to size. 

- Expander carrot should do something on desktop mode, or be removed.
- Shouldn't have to wait for following info to load to do stuff.
- Progressive loading, like in other apps.















Backend Stuff:
- Tag/user follow loading is really slow. (does this lag increase with scale?)
- Payment for all/some actions
  - Pay for shelf creation after the fifth shelf. That's it (for now).








## V2 Features (Separate Canister):

- Download personal data as a csv.
  - This way we could use this function to do it manually at various times.
- More advanced search engine for the setup. So separate architecture with backups (maybe centralized).
  - Adding to public shelves actually can't be done at all right now.
  - We probably need a search engine in the backend?
- A preview of the slots in the profile. (Could be done later)
- NFT 'Appears in' based on secondary SBT data.






- Can't figure it out, it seems.
This when opening the dialog to add to shelf: 
<anonymous code>:1:145535
`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog

























Prompt helper.


- is nft
  - if user is owner of nft
    - go straight to bookmark
  - if user is not the owner of the nft
    - mint an sbt (with the like action)
      - generate the sbt_id from the nft_id
      - proceed with bookmarking of the sbt.
  - done
- is sbt
  - if user owns the sbt
    - go straight to bookmark action
  - if user does not own the sbt.
    - go to the liking action, which derives the original NFT id from the sbt id, and generates the new stb for that user.
    - proceed with bookmarking the nft.
- if it's neither (not an nft yet), proceed with liking it with coordinate_mint, which will mint an original NFT if no-one owns it, or if it was already owned, mint an sbt.
  - then use the proper id to bookmark it to the shelf. 


unifiedCardActions.tsx
NftDisplay.tsx
ContentDisplay.tsx
ShelfCard.tsx
Card.tsx
mint.ts
coordinate_mint.rs
item.rs
id_converter.rs
id_convert.ts.






## Helpful Commands

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal fogrq-ch55d-mwkdr-c5oik-ecjul-eehnn-hajmf-7wt3c-hluo4-txwk3-nae)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch c0ccbd75ca2cb2ce2dab10611df028a4f8e47d0a