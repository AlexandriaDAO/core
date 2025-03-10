### UX/UI Feature TODO

- Should not make a slot by default.
- Connect and a follow button on the shelves.
- Make the shelf path be connected to the owner.
- Another thing is the user sharing side. Do we let them add comments or something or other grids in a community section? How do we sort/rank these or do we let users do that themselves?



- Display actual NFTs in the NFT slot.
- Blog View: Switch from the table to show the markdown style blog with the NFTs inside.


### Future Possible Features

- Shelf Appears In? YES/maybe
- Allowed to edit others users' shelves? NO

## Design

All IC Stable Structures, for V1 only owners can edit shelves.

#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront.

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 nfts.

You don't save Shelfs, you add them to your own shelfs.

The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.










#[Using Modules] 

- SearchContainer Component - Powerful for when we start adding filters to the explore page.
- TopupBalanceWarning Component - If Lexigraph has any operations that require tokens, this could be reused.






To render NFTs in Lexigraph like in other apps, you would:
- Use the ContentRenderer component to render the NFT content inside your slot components
- Ensure the NFT data is properly loaded into the Redux store using the same patterns as Alexandrian
- Use the ContentCard component (which you're already using) with the appropriate props to display NFT metadata
- Potentially use the NftDataFooter component to display consistent NFT metadata

But first I need a plan to ensure that the NFT slots are actual NFTs owned by the user.

So for this it's like a my-library component. Plus a Pinax compontent. Plus aan add to shelf option on every owned NFT.

So first let's figure out what's going on with the ordering of the Alexandrian NFTs.
























# Backdend optimizations: 



## Core Architecture

Your app is built around these primary concepts:
- **Shelves**: The main containers (like a bookshelf)
- **Slots**: Items within a shelf that can contain:
  - Markdown text
  - NFTs
  - References to other shelves (nesting)
