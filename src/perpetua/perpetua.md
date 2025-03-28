
dfx canister uninstall-code perpetua
cargo build --release --target wasm32-unknown-unknown --package perpetua
candid-extractor target/wasm32-unknown-unknown/release/perpetua.wasm > src/perpetua/perpetua.did
dfx deploy perpetua --specified-id ya6k4-waaaa-aaaap-qkmpq-cai
dfx generate perpetua


The output should be an actual prompt that could be provided at the beginning of this conversation and yeild better results.


### UI

- ReorderShelfItem and reorderProfileShelf have similar logic, but different UIs. We should make the UI portion for this reusable so the profile grid is movable.
- We allowing slots in the profile?

What if we just treated the profile as if it was a shelf? Everyone gets a special profile shelf that displays by default on their page.


- Big feature: Organized profile page on the user route.
- Track how many items are in the shelf as part of the initial display.
- Payment for all actions, and removal of topup.
- I think we're going to need tags too (so we could filter the recent one by categories)
- Allowed to edit others users' shelves? YES
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