### UX/UI Feature TODO

Link navigation is always lbry.app/app/user/<shelf_id>/<nft_id>
  - Going back to user shows their shelves.
  - Clicking on any shelf inside a shelf takes you to that shelf: /app/user/<shelf_id>

Blog View:
  - Switch from the table to show the markdown style blog with the NFTs inside.


### Future Possible Features

- Shelf Appears In? YES
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

So for this it's like a my-library component. Plus a Pinax compontent. Plus an add to shelf option on every owned NFT.

So first let's figure out what's going on with the ordering of the Alexandrian NFTs.