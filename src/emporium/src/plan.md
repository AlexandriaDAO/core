- Minted Nft with token id 3 to `xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe`
- Transfer through `icrc7_transfer` to emporium canister
- Nft with token id 3 is now owned by emporium canister
- Called `icrc3_get_archives` query with argument of `xswc6-jimwj-wnqog-3gmkv-hglw4-aedfy-bqmr2-5uyut-cnbbg-4wvsk-bqe`
- Returns empty vector (vec {})

getting error on icrc3_get_blocks

(variant {Err="Call error: CanisterError - failed to decode canister response as (alloc::vec::Vec<emporium::update::Block>, candid::types::number::Nat): Fail to decode argument 0 from table0 to vec record {
id : nat;
block : opt variant {
Map : vec record {
key : text;
value : variant {
Map : Vec;
Nat : nat;
Blob : blob;
Null;
Text : text;
Array : vec DynamicValue;
};
};
};
}"})


I tried using the icrc3_get_blocks function, but it's failing to decode the response. 
The ICRC7 transfer can only be used by the canister to transfer NFTs to the buyer. 

To deposit the NFT from the user and save it in our listing simultaneously, we need to use the icrc37_transfer_from function. 
For security reasons, we will add checks so that the transfer_from function will only be usable by the Emporium canister.

https://internetcomputer.org/docs/current/tutorials/developer-journey/level-5/5.4-NFT-tutorial


Spent time on RND for the behavior of icrc37_transfer_from. The function behaves as expected in Candid UI and CLI, returning Ok(token_id) on successful transfers. However, during inter-canister calls, it inconsistently returns OK([None]) for success. Errors, such as unauthorized NFT transfers, are correctly flagged. 