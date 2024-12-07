/*
The Plan:


- get_two_random_users only gets the principal, not the subaccount.
- Problem is if the transaction call fails, it goes right to adils wallet.


**attack strategy:**

# Get random scion nft
total_supply = icrc7_scion.icrc7_total_supply()
nft_id_block = Rand(1-1000 || Rand(1-total_supply) if total_supply < 1000)
nft_block = total_supply - nft_id_block
rand_nft_id = icrc7_scion.icrc7_tokens(nft_block)
rand_nft_owner = icrc7_scion.icrc7_owner_of(rand_nft_id)

# Find the OG NFT From the Scion NFT
og_nft_id = nft_manager.scion_to_og_id(rand_nft_id, rand_nft_owner)
og_nft_owner = get_nft_owner(og_nft_id, icrc7_scion)

# Get the principal/subaccount combos.
og_nft_subaccount = nft_manager.to_nft_subaccount(og_nft_id)
rand_nft_subaccount = nft_manager.to_nft_subaccount(rand_nft_id)
















Bug; random librarian alex mints don't go to subaccounts or nfts.
- Review tokenomics emissions schedule. Could it be better?






*this assumes that the minting keeps working well*
- Get alexandrian to display Scion NFTs.
- Start improving the grid and display.
- Start displaying the wallets of each NFT, and add a claim button.
- Start to look for bugs, exploits, possiblity of losing funds.


Minor stuff to do:
- Make exploring an owner easier.
- Need to blur blocked images when clicked on.
- We need a more efficient way to get peoples library because it takes a long time if you have a lot of NFTs. Maybe add back the concurrent query calls.
- Need to add a minting check in rust that the NFT created is a real arweave id.
- Get search to work by pressing enter.
- Get thumbnails to show on video, and only load the first frame.
- There's a bug where ebook searching gets the search button stuck in the loading state.
- The x should look nicer and be above the image.
*/


Bigger ones: 
- Disable transfers and other irrelivant functions for scion NFTs.
- 






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

