/*
The Plan:



*this assumes that the minting keeps working well*
inside contentDiplay/ContentData Redux State I have to add the owner of the NFT and the money that's inside it (perhaps even the type, scion or OG).

Maybe for now we could just display the money inside it and that's it. Intentionally leave the rest a mystery?

Or maybe we do this totally in a separate app and never let the user's see who own's what or how much money is inside what.




- Start displaying the wallets of each NFT, and add a claim button.
- Start to look for bugs, exploits, possiblity of losing funds.


Minor stuff to do:
- Make exploring an owner easier.
- Need to blur blocked images when clicked on.
- We need a more efficient way to get peoples library because it takes a long time if you have a lot of NFTs. Maybe add back the concurrent query calls.
- Need to add a minting check in rust that the NFT created is a real arweave id.
- Get thumbnails to show on video, and only load the first frame.
- There's a bug where ebook searching gets the search button stuck in the loading state.
- The x should look nicer and be above the image.
*/


Bigger ones: 
- Disable transfers and other irrelivant functions for scion NFTs.
- Review tokenomics emissions schedule. Could it be better?








Metrics: 
9.97T Cycles in ICP Swap at 830 am, and it's dispersing once per minute.
9.765T Cycles at 7am the next day. (But it could also be that it's because it stopped distributing.)



NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc
MintNFT function:


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.







### Understanding Arweave ID Conversions.

- id_convert.ts has arweaveIdToNat and natToArweaveId and ogToScionId and scionToOgId.
- nft_manager/src/id_converter.rs has arweave_id_to_nat and nat_to_arweave_id.

Currently, scion NFTs are not getting their asset links found correctly because they reference an original NFT that contains the information required to find the asset.

The problem is with getNftOwner.ts, where arweaveIds = nftIds.map(natToArweaveId);, but icrc7_scion nfts are not readily converable to non-scion token ids.

First, scion NFTs need to be converted to their og NFTs with scionToOgId.

In the case where the collection is 'icrc7_scion', we need to convert the scion NFTs to their og NFTs with scionToOgId before passing the result. 

Since we're dealing with an array of scion NFTs, we might find it beneficial to modify the function to take an array of scion NFTs instead of a single one.