todo.md


# General

- frontend needs to be adapted to these changes.

*features*

- Manager/DAO Transfer
- Voting Process/DAO.

- Add money to all update calls (e.g., 1 lbry).
- User Transfer (they'll use icrc7_transfer themseleves from the frontend).

## Current Vulnerabilities

- Someone can call mint_nft() while another nft is being burned/verified/etc. with that mint#. 
If it beats them to the punch, they steal the nft, so mint_nft() needs to be blocked, at least with that mint# while the others are happening.

## Updates

*changes that require frontend help from zeeshan*
- mint_nft()
  - Check that the caller has enough LBRY to call the function.
  - Payment in LBRY to call the function.
    - Will pass the owner of the 'active_engine' used for the upload: `src/alex_frontend/src/features/mint/index.tsx` but that file will needs some changes:
      - It now needs to pass the mint#, a random number greater than total_supply() and has nft_exists() returns false so there's no chance of collisions.
      - It needs to pass the cost in LBRY (1 LBRY + 5LBRY/MB but we can change later in the frontend), so it needs to track the size of the file.


## DAO (canister)

[costs 100 LBRY per NFT to trigger which goes to the address of the NFTs]
      - Send 100LBRY/NFT to canister account.
      - if success, send it back.
      - if rejected, keep it.

struct proposal {
  proposal_id: random uid
  proposer: Account (ic_cdk::api:caller())
  dispute_type: Bool (false unless you're doing for someone elses NFT)
  mint_numbers: Vec<Nat> (max 20)
  proposal_summary: String (X character limit)
  cost_to_download: Nat (in LBRY)
  adopt_count: 0 (vote count by stakers)
  reject_count: 0 (vote count by stakers)
}

create_nft_proposal(mint_numbers: Vec<Nat>, desciption: string)
  - If dispute_type = false:
    - If you own all the mint numbers, and verified() is false for all of them:
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - If dispute_type = true:
    - If you own none of the mint numbers, and they're all unverified:
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - Else: 
    - Reject proposal with propper logging of the reason (you cannot group mint numbers you own with mint numbers you dont | mint numbers are not all unverified).

Voting on proposals: 
  - Users with a stake can optionally vote once, and their vote weight is their stake.
    - You can get the stake from this function which is call able in the icp_swap canister (5qx27-tyaaa-aaaal-qjafa-cai): 
```
#[query]
pub fn get_stake(principal: Principal) -> Option<Stake> {
    STAKES.with(|stakes| stakes.borrow().stakes.get(&principal).cloned())
}
```


settle_proposal(proposal_number)
  - If 'adopted' > 'rejected' (will complicate the consensus later).
    - verify_nfts(proposal)
  - If 'rejected' > 'adopted'
    - Transfer the nft to the manager_nft account with burn_to_lbry()

settle_dispute_proposal(proposal_id)
  - If 'adopted' > rejected
    - verify_nfts() (to the new owner if a dispute proposal, to the same owner if not)
  - If 'adopted' < 'rejected
    - do nothing.


- Need to add the properites of the proposal to the verified nfts. 
  - I'll need to carefully change property_shared, candy_shared, nft_input, and nft_output, but other than that it should be smooth.



*major for later*


- I need to build a database that tracks the icrc7 balances in all the subaccounts. This is going to be an annoying mess, but it's better than doing all those inter-canister calls.






  



