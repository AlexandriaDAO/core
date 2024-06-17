# Setup

### A fresh clean start ✨🆕✨

``` 
dfx start --clean 
```
### Let's deploy Tokenomics canister  🚀

``` 
dfx deploy tokenomics
```
###  Deploy UCG 🌐🔒👥
 

```
dfx deploy UCG --argument "(variant { Init =
record {
     token_symbol = \"UCG\";
     token_name = \"UCG\";
     minting_account = record { owner = principal \"$(dfx canister id tokenomics)\" };
     transfer_fee = 0;
     metadata = vec {};
     initial_balances = vec { record { record { owner = principal \"${DEFAULT}\"; }; 0; }; };
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal \"$(dfx canister id tokenomics)\";
     };
 }
})"
```

###  Deploy LBRY 🎟️

For testing purposes, the tokenomics canister is the minter; you can change it accordingly. 🔄
```
dfx identity use default
export DEFAULT=$(dfx identity get-principal)

dfx deploy LBRY --argument "(variant { Init =
record {
     token_symbol = \"LBRY\";
     token_name = \"LBRY\";
     minting_account = record { owner = principal \"$(dfx canister id tokenomics)\" };
     transfer_fee = 10_000;
     metadata = vec {};
     initial_balances = vec { record { record { owner = principal \"${DEFAULT}\"; }; 10_000_000_000; }; };
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal \"$(dfx canister id tokenomics)\";
     };
 }
})"
```
The most important thing is that we need to give allowance to the tokenomics canister for burning the LBRY canister. 🔥🔄

```
dfx canister call --identity default LBRY icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$(dfx canister id tokenomics)\";
    };
    amount = 10_000_000_000: nat;
  }
)"
```
### Deploy Bookmarks canister 📚🔖
```
dfx deploy bookmarks 
```

### Let's test. ✔️
lets call init_bm 
It should burn 1 LBRY and mint 1000 UCG to the caller's account. 🔥💰
```
dfx canister call bookmarks init_bm '(1,"me","it_is_what_is_it","Thinking","TBD")'
```
Head over to the tokenomics candid UI for queries for stats.📊