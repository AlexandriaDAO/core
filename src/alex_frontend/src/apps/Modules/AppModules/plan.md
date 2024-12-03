/*
The Plan:

So stakes now works, but the problem is the stable storage does not have respect for subaccounts, so I gotta add subaccounts to all the data structures.

So here's the deal. I got to make canisters for different users, and it's just gotta be that way because stable storage doesnt work by subaccount.
There's also no point in adding the complexity of making internal storage subaccount-specific.

- get_two_random_users only gets the principal, not the subaccount.
- Problem is if the transaction call fails, it goes right to adils wallet.



Bug; random librarian alex mints don't go to subaccounts or nfts.
- Review tokenomics emissions schedule. Could it be better?
- Should we proceed with this mining option, or perhaps use bot prevention by limiting the rewards to NFTs only? I.e., non-null subaccount transactors.



- I need to add alex balance to the topup wallet and allow the user to claim it.

*this assumes that the minting keeps working well*
- Get alexandrian to display Scion NFTs.
- Start improving the grid and display.
- Start displaying the wallets of each NFT, and add a claim button.
- Start to look for bugs, exploits, possiblity of losing funds.


Minor stuff to do:
- Make exploring an owner easier.
- Need to blur blocked images when clicked on.
- We need a more efficient way to get peoples library because it takes a long time if you have a lot of NFTs. Maybe add back the concurrent query calls.

*/













NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc
MintNFT function:

- (Need to error handle when meiliService query fails, so we don't crash the app.)
- Bug; Other file types are mintable when not logged in.

Change the nft_manager to mint_nft function to mint the copy if the nft already exists; and figure out how to pay the 1-2 lbry depending on which one is triggered. (I don't know how we trigger the payment from the frontend. We could also make a flat fee, and just split it 50/50, but I don't think it's any easier.)

      - If someone copies the copy, 1 lbry goes to the og, one to the copy.


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.

*Security Todos*
- Need to check that the minting number decodes to a valid arweave id (if possible, otherwise people can mint nothing nfts, or ones that don't pass the nsfw check).
  - Otherwise we need some general check that the nft corresponds to an arweave id. (This should replace the is_under_100_digits check.)
  -- Perhaps we make the call have to come from the frontend? --

