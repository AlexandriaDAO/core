Perpetua/
├── features/
│   ├── cards/
│   │   ├── components/
│   │   │   ├── BaseShelfList.tsx (407 lines)
│   │   │   ├── ContentDisplays.tsx (120 lines)
│   │   │   ├── NftDisplay.tsx (350 lines)
│   │   │   ├── ShelfCard.tsx (162 lines)
│   │   │   ├── ShelfCardActionMenu.tsx (173 lines)
│   │   │   ├── ShelfDetailView.tsx (624 lines)
│   │   │   └── index.ts (1 lines)
│   │   ├── containers/
│   │   │   ├── ShelfLists.tsx (226 lines)
│   │   │   └── index.ts (1 lines)
│   │   ├── index.ts (10 lines)
│   │   └── types/
│   │       ├── index.ts (1 lines)
│   │       └── types.ts (60 lines)
│   ├── items/
│   │   ├── components/
│   │   │   ├── AddToShelfDialog.tsx (170 lines)
│   │   │   ├── ItemActionMenu.tsx (61 lines)
│   │   │   ├── ItemReorderManager.tsx (61 lines)
│   │   │   ├── NewItem.tsx (358 lines)
│   │   │   ├── NftSearch.tsx (270 lines)
│   │   │   └── index.ts (2 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (2 lines)
│   │   │   ├── useItemActions.tsx (104 lines)
│   │   │   └── useItemReordering.ts (73 lines)
│   │   └── index.ts (2 lines)
│   ├── shared/
│   │   └── hooks/
│   │       └── useReorderable.ts (267 lines)
│   ├── shelf-collaboration/
│   │   └── components/
│   │       └── CollaboratorsList.tsx (177 lines)
│   ├── shelf-management/
│   │   ├── components/
│   │   │   ├── NewShelf.tsx (97 lines)
│   │   │   ├── RemoveItemButton.tsx (110 lines)
│   │   │   ├── ShelfContent.tsx (80 lines)
│   │   │   ├── ShelfOption.tsx (30 lines)
│   │   │   ├── ShelfSelectionDialog.tsx (134 lines)
│   │   │   └── index.ts (5 lines)
│   │   ├── containers/
│   │   │   └── ShelfDetailContainer.tsx (143 lines)
│   │   ├── hooks/
│   │   │   ├── index.ts (4 lines)
│   │   │   ├── useAddToShelf.ts (106 lines)
│   │   │   ├── usePublicShelfOperations.ts (61 lines)
│   │   │   ├── useShelfOperations.ts (152 lines)
│   │   │   └── useShelfReordering.ts (106 lines)
│   │   ├── index.ts (3 lines)
│   │   └── types/
│   │       └── index.ts (27 lines)
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
│   ├── index.ts (1 lines)
│   └── useContentPermissions.ts (75 lines)
├── index.tsx (17 lines)
├── layouts/
│   ├── PerpetuaLayout.tsx (214 lines)
│   └── index.ts (1 lines)
├── routes.ts (119 lines)
├── state/
│   ├── cache/
│   │   └── ShelvesCache.ts (209 lines)
│   ├── hooks/
│   │   ├── index.ts (3 lines)
│   │   ├── usePerpetuaActions.ts (119 lines)
│   │   └── usePerpetuaSelectors.ts (61 lines)
│   ├── index.ts (47 lines)
│   ├── perpetuaSlice.ts (343 lines)
│   ├── services/
│   │   └── perpetuaService.ts (419 lines)
│   ├── thunks/
│   │   ├── collaborationThunks.ts (128 lines)
│   │   ├── index.ts (6 lines)
│   │   ├── itemThunks.ts (94 lines)
│   │   ├── queryThunks.ts (155 lines)
│   │   ├── reorderThunks.ts (129 lines)
│   │   └── shelfThunks.ts (157 lines)
│   ├── utils/
└── utils.tsx (136 lines)












- useItemReordering.ts and useShelfReordering.ts contain similar reordering logic. Extract the common functionality into a shared hook.

- Consolidate type definitions between features/cards/types/types.ts and features/shelf-management/types/index.ts - they likely have overlapping types.

- AddToShelfDialog.tsx and ShelfSelectionDialog.tsx appear to have similar functionality. Consider merging or extracting shared logic.
- ItemActionMenu.tsx and ShelfCardActionMenu.tsx likely share similar patterns and could be generalized into a base component with specializations.









dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua


The output should be an actual prompt that could be provided at the beginning of this conversation and yeild better results.


## V1 Features


- For whatever reason, NFTs aren't being added to the thing.

- Big feature: Organized profile page on the user route.
- Track how many items are in the shelf as part of the initial display.
- Payment for all actions.
- I think we're going to need tags too (so we could filter the recent one by categories)
- Allowed to edit others users' shelves? YES
- Shelf Appears In? YES/maybe


## V2 Features: 

- A preview of the slots in the profile. (Could be done later)






## Design

All IC Stable Structures, for V1 only owners can edit shelves.

#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront.

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 nfts.

You don't save Shelfs, you add them to your own shelfs.

The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.










#[Using Modules] 

- SearchContainer Component - Powerful for when we start adding filters to the explore page.
- TopupBalanceWarning Component - If Perpetua has any operations that require tokens, this could be reused.






To render NFTs in Perpetua like in other apps, you would:
- Use the ContentRenderer component to render the NFT content inside your slot components
- Ensure the NFT data is properly loaded into the Redux store using the same patterns as Alexandrian
- Use the ContentCard component (which you're already using) with the appropriate props to display NFT metadata
- Potentially use the NftDataFooter component to display consistent NFT metadata

But first I need a plan to ensure that the NFT slots are actual NFTs owned by the user.

So for this it's like a my-library component. Plus a Pinax compontent. Plus aan add to shelf option on every owned NFT.

So first let's figure out what's going on with the ordering of the Alexandrian NFTs.























Homepage Animation thoughts:

I saw you had that big ball in the middle, with a bunch of extending tenticals.
I think that can apply as to the grand vision if it somehow animates two parts, one expanding into and one expanding from.

We might call Alexandria the "Universal Content Protocol"
The ball in the center is 'Alexandria Core', which "Makes files a lot more like Bitcoin"
- Everything in it is a "Universal Content Unit" wich is it's own:
  - "Asset" - Owned by someone.
  - "Business" - Earns money whenever it is re-used.
  - "Bank" - Holds money on behalf of its creator.
  - "NFT" - Self-rendering permanent asset with dynamic metadata attributes.

What goes from the tenticals into 'Alexandria Core' is:
  - Ebooks
  - Images
  - Videos
  - Songs
  - Movies
  - Documents
  - ... Could add more if it fits the animation better

What comes out of the 'Alexandria Core' from the tenticals is:
  ∞ Alexandrian (d-Drive)
  ∞ Bibliotheca (d-Kindle)
  ∞ Emporium (d-Commerce)
  ∞ Perpetua (d-Social)
  ∞ Syllogos (d-Google)
  ... Could add more if it fits the animation better

Call to action: "A digital life that's timeless, under one roof, and truly yours."