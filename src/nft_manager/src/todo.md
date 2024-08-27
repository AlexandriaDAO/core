todo.md

# General
- Force authorized callers:
    // fn check_caller() {
    //     let allowed_principal = Principal::self_authenticating(pk);
    //     if caller() != allowed_principal {
    //         ic_cdk::trap("Unauthorized caller");
    //     }
    // }
- Need to add the fake burn and the real burn. Fakeburn if unverified, real burn if verified.
- User Transfer
- Manager/DAO Transfer
- Voting Process/DAO.

# Security
- Set Canister Freezing Threshold (both manager, and icrc7)
- Block all calls to the ICRC7 Canister.
- Check bounds on all parameters. Ensure no space bombs.

- Add a system level canister_inspect_message function with #[inspect_message] that:
    - Possibly only allows frontend canister messages to make update calls.
    - Possibly adds an extra layer of protection for the icrc7 canister.


## Wallets

Audit should check to ensure there's no possibility that a mint# can change or be lost so the money never gets lost.

- Auth to ensure caller is the only one who can withdraw.
- Ensure only verified NFTs can be withdrawn.
- Batch withdraw (atomic)


## Updates
- No Anon callers.
- Payment in LBRY to call the function.
- 




## Canister Settings:


*dfx canister status nft_manager --network ic*

Status: Running
Controllers: 2jgt7-v33z4-tiosh-csi2v-66cge-4uu7j-v2nye-z27vc-d36pc-ctqai-bqe yog5q-6fxnl-g4zd4-s2nuh-f7fkw-ijb4e-z7dmo-jrarx-uoe2x-wx5sh-dae
Memory allocation: 0
Compute allocation: 0
Freezing threshold: 2_592_000
Memory Size: Nat(2196)
Balance: 8_879_501_528_117 Cycles
Reserved: 0 Cycles
Reserved Cycles Limit: 5_000_000_000_000 Cycles
WASM Memory Limit: 0 Bytes
Module hash: None
Number of queries: 52
Instructions spent in queries: 3_103_930_401
Total query request payload size (bytes): 19_903
Total query response payload size (bytes): 53_077_063