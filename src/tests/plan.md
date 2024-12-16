/*
The Plan:



- One of the tokens on the test app got 2 LBRY. Is it possible we're sending the lbry before checking if it already is owned by the user?
- We need a stop button for the loading state for when it gets stuck.
- Then make the existing arweave data look nice.





- Start displaying the wallets of each NFT, and add a claim button.
- Start to look for bugs, exploits, possiblity of losing funds.


Minor stuff to do:
- Make exploring an owner easier.
- Need to blur blocked images when clicked on.
- Need to add a minting check in rust that the NFT created is a real arweave id.
- Get thumbnails to show on video, and only load the first frame.
- There's a bug where ebook searching gets the search button stuck in the loading state.
- The x should look nicer and be above the image.
- Move the mint and info buttons below the image.

Alexandrian: 
- Rank by token amounts.
- Switch the reverse state to show most recent first.
*/


Bigger ones: 
- Disable transfers and other irrelivant functions for scion NFTs.
- Review tokenomics emissions schedule. Could it be better?
  - I actually reserve that it's already pretty good, but we just need to put a max alex mint per call at 5 ALEX. So the cap is basically 1 LBRY per call in the beginning.







<!-- PRD for the test canister: 
```
type BalanceResult = record { icp : float64; alex : float64; lbry : float64 };
type Result = variant { Ok : text; Err : text };
type TestAccounts = record {
  one : text;
  two : text;
  three : text;
  root : text;
};
service : {
  burn : (nat64, text) -> (Result);
  check_balances : (vec text) -> (vec BalanceResult);
  check_swap_canister_balance : () -> (float64);
  claim_icp_reward : (text) -> (Result);
  get_test_accounts : () -> (TestAccounts) query;
  stake : (nat64, text) -> (Result);
  swap : (nat64, text) -> (Result);
  unstake : (text) -> (Result);
}
```

Pseudocode for the test canister: 


pub fn random_action(percentage_chance) -> bool

- every 10 seconds, trigger a loop with ic_cdk_timers.
  - Check_balances() | E.g.: › check_balances(vec {"root"}) -> (vec {record {icp=0; alex=0; lbry=0}})
    - If ICP > 1
      - random_action(50)
      - Call the swap function to the nearest whole number balance rounded down: 
        - E.g.: check_balances(vec {"root"})
                (vec {record {icp=98.9997; alex=0; lbry=0}})
                › swap(98, "root")
                (variant {Ok="Swapped Successfully!"})
    - If LBRY > 10
      - random_action(50)
      - burn(total LBRY balance -0.04 LBRY for the fee)
    - If ALEX > 1
      - stake(total ALEX balance, rounded down to the nearest whole number)
  - random_action(10)
    - unstake(root)
  - random_action(35)
    - claim_icp_reward(root) -->




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







