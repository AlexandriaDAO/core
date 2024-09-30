todo.md


# General

- Add money to all update calls (e.g., 1 lbry).
- User Transfer (they'll use icrc7_transfer themseleves from the frontend).

## Updates

*changes that require frontend help from zeeshan*
- mint_nft()
  - Check that the caller has enough LBRY to call the function.
  - Payment in LBRY to call the function.
    - Will pass the owner of the 'active_engine' used for the upload: `src/alex_frontend/src/features/mint/index.tsx` but that file will needs some changes:
      - It now needs to pass the mint#, a random number greater than total_supply() and has nft_exists() returns false so there's no chance of collisions.
      - It needs to pass the cost in LBRY (1 LBRY + 5LBRY/MB but we can change later in the frontend), so it needs to track the size of the file.




*major for later*


- I need to build a database that tracks the icrc7 balances in all the subaccounts. This is going to be an annoying mess, but it's better than doing all those inter-canister calls.






  



