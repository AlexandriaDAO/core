set -x 

# src/nft_manager/nft_manager.sh

# Set identities and check balances.
export NFT_MANAGER_PRINCIPAL="5sh5r-gyaaa-aaaap-qkmra-cai"
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = null})'
dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'
cargo build --release --target wasm32-unknown-unknown --package nft_manager
candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did
dfx deploy nft_manager --specified-id 5sh5r-gyaaa-aaaap-qkmra-cai

# TEST EVERYTHING

# # MINT AN NFT: 
# dfx canister call nft_manager mint_nft '("asfd", opt 10240)'


# # Send some LBRY and ALEX to NFT# 10,240.
# dfx canister call LBRY icrc1_transfer '(record {to = record {
#         owner = principal "'${NFT_MANAGER_PRINCIPAL}'";
#         subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8}
#       };
    
#       from = record {
#             owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
#   };
  
#   amount = 150000000;
#   fee = null;
# }
# )'

# dfx canister call ALEX icrc1_transfer '(record {to = record {
#         owner = principal "'${NFT_MANAGER_PRINCIPAL}'";
#         subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8}
#       };
    
#       from = record {
#             owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
#   };
  
#   amount = 350000000;
#   fee = null;
# }
# )'

# # Check the balance is there.
# dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8} })'
# dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'

# dfx canister call ALEX icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8} })'
# dfx canister call ALEX icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'


# dfx canister call nft_manager withdraw '(10240)'

# dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${NFT_MANAGER_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 1:nat8; 0:nat8; 2:nat8; 4:nat8; 0:nat8} })'
# dfx canister call LBRY icrc1_balance_of '(record { owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'"; subaccount = opt vec {0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8; 0:nat8} })'











# // This works like a charm.
# linus@Henry:~/alexandria/core$ dfx canister call icrc7 icrcX_burn '(
#     record {
#       memo = null;
#       tokens = vec { 2 : nat };
#       created_at_time = null;
#     }
#   )'

# // This does not work.
# dfx canister call nft_manager mint_nft '("asdf", 2)'

# dfx canister call nft_manager verify_nfts '(vec { 2 : nat }, principal "5sh5r-gyaaa-aaaap-qkmra-cai")'

# dfx canister call nft_manager burn_nft '(2 : nat)'

# (
#   variant {
#     Err = "Error calling icrcX_burn: CanisterError - failed to decode canister response as (alloc::vec::Vec<nft_manager::update::BurnResult>,): Fail to decode argument 0"
#   },
# )