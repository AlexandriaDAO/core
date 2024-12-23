/*
The Plan:


Create in the tests canister a function that burns the LBRY one at a time (say every 10 seconds). Allow the user to approve their tokens to the tests canister. Store a record of the approvals. And use burn() during each loop.

Steps: 
- Change burn function to take a list of principals (instead of subaccount name.)
- See if you could do a batch burn.
- If not, just do it in a loop that has a fair order.

- Or maybe we need a better way to a allow people to do whatever burn amount they want, but they have to wait a while.




Minor stuff to do:
- NFT Logos to deploy args.
- Show more should not appear on alexandrian.
- The timeslot won't allow you to select the time you want. It keeps changing it.
- Remove duplicates based on file size.
- Staking timeline needs to be moved to 1% every hour.
- 50 ALEX mint cap per call.
- Need to delete my old NFTs, or transfer them to another user.
- NFT Minting to 5-10 LBRY



*/


Bigger ones: 
- Enable icrc37 transfers to ICRC7 with emporium guard on approvals()














### Adding channels/blocks/collections to sort NFTs.

Metrics: 
9.97T Cycles in ICP Swap at 830 am, and it's dispersing once per minute.
9.765T Cycles at 7am the next day. (But it could also be that it's because it stopped distributing.)
9.470 Several days later (12/16), right before deploying tests canister. (the tests canister itself has 8.81T cycles at noon before deployment)
12/19 (3 days later): icp_swap is at 9.025 and tests is at 7.411.


XWKa-Q2gppignoX_Ngs7VJYZPN_yhiy1ToovQ1NBMFs
NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g  09/18/2022
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc

MintNFT function:


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.








Low Priority: 

- Get thumbnails to show on video, and only load the first frame.
- There's a bug where ebook searching gets the search button stuck in the loading state.
- Add Milliseconds place to permasearch. 
- Remove duplicates based on file size.
- More advanced searching with tags and metadata.

