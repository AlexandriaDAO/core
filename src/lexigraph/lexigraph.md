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
