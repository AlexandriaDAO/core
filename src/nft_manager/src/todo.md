todo.md


# General

- frontend needs to be adapted to these changes.

*features*

- User Transfer
- Manager/DAO Transfer
- Voting Process/DAO.

*ultra security checklist*

- all nft_manager functions that cost money only require a non-anon caller.
- all nft_manager functions that don't are only callable by the frontend canister.
- And the ICRC7 Cansiter issue:
  - Updates callable by nft_manager only.
  - Queries callable by nft_manager and alex_frontend only.
- In withdraw functions, block unmatched callers (they're tring to ddos).


## Wallets

Audit should check to ensure there's no possibility that a mint# can change or be lost so the money never gets lost.

- Auth to ensure caller is the only one who can withdraw.
- Ensure only verified NFTs can be withdrawn.
- Batch withdraw_all (atomic)


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
    - If you own all the mint numbers, and they're all unverified:
      - Send 100LBRY/NFT to proper accounts.
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - If dispute_type = true:
    - If you don't own none of the mint numbers, and they're all unverified:
      - Send 100LBRY/NFT to proper accounts.
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - Else: 
    - Reject proposal with propper logging of the reason.

settle_proposal(proposal_number)
  - If 'adopted' > 'rejected' (will complicate the consensus later).
    - verifs_nfts(proposal)
  - If 'rejected' > 'adopted'
    - Transfer the nft to the manager_nft account.

settle_dispute_proposal(proposal_id)
  - If 'adopted' > rejected
    - verify_nfts() (to the new owner if a dispute proposal, to the same owner if not)
  - If 'adopted' < 'rejected
    - do nothing.


- Need to add the properites of the proposal to the verified nfts. 
  - I'll need to carefully change property_shared, candy_shared, nft_input, and nft_output, but other than that it should be smooth.



*major for later*


- I need to build a database that tracks the icrc7 balances in all the subaccounts. This is going to be an annoying mess, but it's better than doing all those inter-canister calls.






  



