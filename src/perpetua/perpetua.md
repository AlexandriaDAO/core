### UI

- Add shelf to shelf by some button or something.



### Backend Decision TODOs
- Payment for all actions, and removal of topup.
- I think we're going to need tags too (so we could filter the recent one by categories)
- Allowed to edit others users' shelves? NO



### Future Possible Features

- Shelf Appears In? YES/maybe

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















## Core Architecture

Your app is built around these primary concepts:
- **Shelves**: The main containers (like a bookshelf)
- **Slots**: Items within a shelf that can contain:
  - Markdown text
  - NFTs
  - References to other shelves (nesting)

src/alex_frontend/src/apps/app/Perpetua/features/
├── shelf-management/
│   ├── containers/
│   │   └── ShelfDetailContainer.tsx  # Business logic container
│   ├── components/
│   │   └── ...
│   ├── hooks/
│   │   └── useShelfOperations.ts
│   └── index.ts
│
├── cards/
│   ├── components/
│   │   └── ShelfDetailView.tsx      # Presentational component
│   ├── containers/
│   │   └── ...
│   ├── types/
│   │   └── types.ts
│   └── index.ts











