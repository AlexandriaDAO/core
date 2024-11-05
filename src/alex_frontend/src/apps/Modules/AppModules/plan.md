
MintNFT function:



Make a icrc7_scion (or spawn/scion/heir/twin) canister.
Get NFT_manager to deploy it.


Change the nft_manager to mint_nft function to mint the copy if the nft already exists; and figure out how to pay the 1-2 lbry depending on which one is triggered. (I don't know how we trigger the payment from the frontend. We could also make a flat fee, and just split it 50/50, but I don't think it's any easier.)




- If caller already owns the NFT, stop and let them know.
- If an NFT already exists, mint a parrellel NFT.
  - This NFT has a mint# derived from the OG minte# and the user principal.

  How do we distinguish this, and make quick reference to the original?
    - The og mint# in the description metadata.
    - The mint# is derived from the OG mint# and the user principal. (Must be repeatable so if someone goes to mint the original for the second time, it will fail.)
      - If someone copies the copy, 1 lbry goes to the og, one to the copy.


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.





# Changes

Alexandrian transactions will have the nft owner state that decides how saves are handled, and it's own version of mintable that handles the outcomes of saves.

1. Remove the duplicate image requests in the network tab.
  - This is happening because the image selector is already loaded before the image opens.
1. Wipe the arweave/transactions state when pages changes.
1. Get rid of the nsfw state in the library appmodule.



### Redux solutions.

Right now permassearch/transactions isn't wiping its stuff on each search. It's also loading the transactions in parallel with the icrc7 requests.

Let's just fix the library transactions state first, and configure 

Well where are we going to perform the filtering operations? Probably a libmodule? Or in the library?

