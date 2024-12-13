/*
The Plan:


Psuedocode for Adil's function in NFT Manager: 
function deduct_marketplace_fee(actual_caller: Principal, fee_amount: nat):
// Ensure only the "emporium" can call this function

// Retrieve the subaccount associated with the actual caller
subaccount = get_subaccount_for_principal(actual_caller)

// Call the ICRC1 transfer function to deduct the fee
transfer_result = icrc1_transfer(
from_subaccount=subaccount,
to_subaccount=MARKETPLACE_ACCOUNT or icp_swap canister id(incase of burn),
amount=fee_amount
)

// Handle transfer result
if transfer_result != SUCCESS:
throw TransferError("Fee deduction failed. Error code: " + transfer_result)

return "Marketplace fee successfully deducted."




Minor stuff to do:

- Need to add a minting check in rust that the NFT created is a real arweave id.
- Get thumbnails to show on video, and only load the first frame.
- There's a bug where ebook searching gets the search button stuck in the loading state.
- Make the open view scrollable for long images.

Alexandrian: 
- Rank by token amounts.
- Switch the reverse state to show most recent first.
*/


Bigger ones: 
- Disable transfers and other irrelivant functions for scion NFTs.
- Review tokenomics emissions schedule. Could it be better?
  - I actually reserve that it's already pretty good, but we just need to put a max alex mint per call at 5 ALEX. So the cap is basically 1 LBRY per call in the beginning.








Now that that's done we need to figure out how to replicate this for the more generic user that can freely call the functions from only this canister.
- Also what are we going to do about NFTs?
  - I should probably add the claim feature to the nfts first.
  - Then maybe we allow you to send NFTs to the test canister and make money off of them.

Wait. Maybe we have channels be these canisters?























Metrics: 
9.97T Cycles in ICP Swap at 830 am, and it's dispersing once per minute.
9.765T Cycles at 7am the next day. (But it could also be that it's because it stopped distributing.)
9.470 Several days later (12/16), right before deploying tests canister. (the tests canister itself has 8.81T cycles at noon before deployment)



NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc
MintNFT function:


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.







