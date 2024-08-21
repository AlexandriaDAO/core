set -x 

# src/nft_manager/nft_manager.sh

# Set identities and check balances.
export NFT_MANAGER_PRINCIPAL="forhl-tiaaa-aaaak-qc7ga-cai"
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = null})'
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'



# Fresh delploy
cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

dfx deploy nft_manager --specified-id forhl-tiaaa-aaaak-qc7ga-cai



# Send some LBRY to NFT #1.
dfx canister call LBRY icrc1_transfer '(record {to = record {
        owner = principal "'${NFT_MANAGER_PRINCIPAL}'";
        subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8}
      };
    
      from = record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
  };
  
  amount = 1500000;
  fee = null;
}
)'

dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'


# Send from NFT #1 to the owner.
dfx canister call nft_manager transfer '(
    record {
        amount = 12345;
        mint_number = 0;
        to_account = record {
            owner = principal "'"$DEFAULT_ACCOUNT_PRINCIPAL"'";
            subaccount = null;
        };
    }
)'

# New balance: 
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'







# # TEST EVERYTHING AGAIN WITH A BIG NFT
# Send from NFT 10,240.
dfx canister call LBRY icrc1_transfer '(record {to = record {
        owner = principal "'${NFT_MANAGER_PRINCIPAL}'";
        subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8}
      };
    
      from = record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
  };
  
  amount = 1500000;
  fee = null;
}
)'

# Check the balance is there.
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8} })'
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'


dfx canister call nft_manager transfer '(
    record {
        amount = 12345;
        mint_number = 10240;
        to_account = record {
            owner = principal "'"$DEFAULT_ACCOUNT_PRINCIPAL"'";
            subaccount = null;
        };
    }
)'
