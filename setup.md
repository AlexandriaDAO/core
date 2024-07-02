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
dfx identity use default
export DEFAULT=$(dfx identity get-principal)
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

```
dfx identity use default
export DEFAULT=$(dfx identity get-principal)

dfx deploy LBRY --argument "(variant { Init =
record {
     token_symbol = \"LBRY\";
     token_name = \"LBRY\";
     minting_account = record { owner = principal \"$(dfx canister id icp_swap)\" };
     transfer_fee = 0;
     metadata = vec {};
     initial_balances = vec { record { record { owner = principal \"${DEFAULT}\"; }; 0; }; };
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal \"$(dfx canister id icp_swap)\";
     };
 }
})"
```
The most important thing is that we need to give allowance to the icp_swap canister for burning the LBRY canister. 🔥🔄

```
dfx canister call --identity default LBRY icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$(dfx canister id icp_swap)\";
    };
    amount = 10_000_000_000: nat;
  }
)"
```
UCG Allowance 
```
dfx canister call --identity default UCG icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$(dfx canister id icp_swap)\";
    };
    amount = 10_000_000_000: nat;
  }
)"
```
### Deploy Local ICP
```
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)

dfx deploy icp_ledger_canister --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$DEFAULT_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
"
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