/*
The Plan:


The tests canister can't mint NFTs because it cant make a topup account? That'd be ideal.




Minor stuff to do:


*/


Bigger ones: 
- Enable icrc37 transfers to ICRC7 with emporium guard on approvals()
- 5 ALEX mint cap per call. So the cap is basically 1 LBRY per call in the beginning.






### Test Canister Stuff

Now that that's done we need to figure out how to replicate this for the more generic user that can freely call the functions from only this canister.
- Also what are we going to do about NFTs?
  - I should probably add the claim feature to the nfts first.
  - Then maybe we allow you to send NFTs to the test canister and make money off of them.

Wait. Maybe we have channels be these canisters?









### Adding channels/blocks/collections to sort NFTs.

Metrics: 
9.97T Cycles in ICP Swap at 830 am, and it's dispersing once per minute.
9.765T Cycles at 7am the next day. (But it could also be that it's because it stopped distributing.)
9.470 Several days later (12/16), right before deploying tests canister. (the tests canister itself has 8.81T cycles at noon before deployment)
12/19 (3 days later): icp_swap is at 9.025 and tests is at 7.411.



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

