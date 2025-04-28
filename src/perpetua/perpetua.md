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
```



- Really, next thing is to just play around a LOT with the new system and get out the kinks.
- Reduce buttons even further (clicking on the NFT brings up the info, and the button is just a bookmark (no follow owner or anything else, just bookmarking!!!))


- The add to shelves option doesn't open if it's already owned by a user, which is foolish, because an owner should be able to add it to any shelf. (it gives you a toast of "You already liked this item" or "You already own this NFT", and so it's a hiccup in the user flow). It should be if you own an NFT or an SBT, you should be able to add it to as many shelves as you like.






























First some context. This is a big project with a suite of apps that use NFTs as a content primative. Every peice of permanent content is an NFT, but you could get a copy of someone's NFT (an SBT) in order to use it by liking the original NFT.

In the Permasearch app, we're just searching arweave transactions. People can mint them as NFTs, usually for the first time, but if they're already owned than the backend mints an SBT for that person. To trigger the mint action on Permasearch though, we need to run the nsfw check to ensure porn isn't minted as an NFT. After that though, after it's minted as an NFT or SBT, we never need to run the nsfw check on them again, so minting as an option is always availible by default. Then in the alexandrian app, we search through existing NFTs, which are areweave transactions that are minted as NFTs on our backend, so we treat them as NFTs/SBTs. Then in the Perpetua app we use these nfts in a content grid style social app. The social app has it's own two primitives: Shelves and Items.

A shelf holds a grid of items, that's it.
An item is a (1) NFT/SBT, and only it's owner can add it to a shelf, or (2) some markdown text which anyone can add, or (3) another shelf which anyone can add.


All of these, both independent NFTs, or shelves or markdown items or items of any kind, all of them, appear in the UI in the same style of card.

Now here's the problem. We consolidated these functionalities in a single button that opens up a set of options in UnifiedCardActions.tsx. For one thing user's can click 'show details' or 'follow owner', but the flow for minting the NFT so you could add it to a shelf is not there. 

The ideal user flow is the. A user can click on any asset to move forward by 'bookmarking' it, that is, adding it to a shelf, as part of the UnifiedCardActions.

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

But right now I don't see that option to mint or bookmark or add to shelf anywhere so something is wrong with the conditions that we're using.

Perhaps the ideal way foward is to consolidate this code and get it working in a separate compontent that puts all the buttons into one uniform dropdown without scattering overlapping functionality all over the place. First find all the involved components and come up with a methodlogy for consolidation. Any new approach should remove unused code, not overproduce more new code.

It's also very important to make the 'toasts' involved in this process explain what's actually happening in the backend, not a arbitrary frontend error message, so let's make sure the toast logs are all accurate to what is occuring during the flow.









































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














Mainnet bug findings: 

- Should be able to add an item to multiple shelves at once, not one at a time.
- (Will fix this when I deploy without all nfts)Withdraw button is partially underneath the expander button.

Major (whole moring):
- Make saves/shelf-additions/etc./Single-Step.





Minor Frontend Stuff:
- Enforce 100 char title, 500 char description.
- Shelves actually have a 10 tag max in the backend. Should we change this? (and 50 chars)
- Max 500 items per shelf.
- 10k markdown chars.


Backend Stuff:
- Search engine for shelves (public ones at least.)
- Payment for all/some actions
  - Pay for shelf creation after the fifth shelf. That's it (for now).
- Download personal data as a csv.
  - This way we could use this function to do it manually at various times.
- Feed: 'Following' with your feed being the latest of those you're following? Could we make a query function for that?




 


## V2 Features (Separate Canister):
- More advanced search engine for the setup. So separate architecture with backups (maybe centralized).
- A preview of the slots in the profile. (Could be done later)







## Helpful Commands

dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal 2p7fi-l3ykz-vhg7k-inwpw-kuia3-2iiv2-dm6qm-rcnp3-jdfnm-od6uw-rae)


npx ts-unused-exports tsconfig.json src/alex_frontend/src/apps/app/Perpetua
npx ts-prune --project src/alex_frontend/src/apps/app/Perpetua
npx ts-unused-exports tsconfig.json


dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua

git show --patch c0ccbd75ca2cb2ce2dab10611df028a4f8e47d0a



