set -x 

#!/bin/bash
cp dfx_local.json dfx.json

# Step 1: Start dfx
dfx stop
dfx start --background --clean

# Step 2: Initialize DFX with Internet Identity
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity

# Step 3: Deploy tokenomics and icp_swap
dfx deploy tokenomics --specified-id uxyan-oyaaa-aaaap-qhezq-cai

dfx deploy icp_swap --specified-id 5qx27-tyaaa-aaaal-qjafa-cai


# Step 4: Configure Local Identities
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)



# Step 5: Deploy the ICRC Ledger with LBRY and UCG tokens
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "  
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


dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '(variant { Init = 
record {
     token_symbol = "LBRY";
     token_name = "LBRY";
     minting_account = record { owner = principal "'$(dfx canister id icp_swap)'" };
     transfer_fee = 0;
     metadata = vec {};
     initial_balances = vec { record { record { owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'" }; 0 } };
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'$(dfx canister id icp_swap)'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'
# // Evan code 
# dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '
#   (variant {
#     Init = record {
#       token_name = "LBRYs";
#       token_symbol = "LBRY";
#       minting_account = record {
#         owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
#       };
#       initial_balances = vec {
#         record {
#           record {
#             owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
#           };
#           100_000_000_000;
#         };
#       };
#       metadata = vec {};
#       transfer_fee = 100_000;
#       archive_options = record {
#         trigger_threshold = 2000;
#         num_blocks_to_archive = 1000;
#         controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
#       };
#       feature_flags = opt record {
#         icrc2 = true;
#       };
#     }
#   })
# '
dfx deploy ALEX --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '(variant { Init = 
record {
     token_symbol = "ALEX";
     token_name = "ALEX";
     minting_account = record { owner = principal "'$(dfx canister id tokenomics)'" };
     transfer_fee = 0;
     metadata = vec {};
     initial_balances = vec { record { record { owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'" }; 0 } };
     archive_options = record {
         num_blocks_to_archive = 1000;
         trigger_threshold = 2000;
         controller_id = principal "'$(dfx canister id tokenomics)'";
     };
     feature_flags = opt record {
        icrc2 = true;
     };
 }
})'
#// Evan code 
# dfx deploy UCG --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '
#   (variant {
#     Init = record {
#       token_name = "UncensoredGreats Token";
#       token_symbol = "UCG";
#       minting_account = record {
#         owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
#       };
#       initial_balances = vec {
#         record {
#           record {
#             owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
#           };
#           100_000_000_000;
#         };
#       };
#       metadata = vec {};
#       transfer_fee = 10_000;
#       archive_options = record {
#         trigger_threshold = 2000;
#         num_blocks_to_archive = 1000;
#         controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
#       };
#       feature_flags = opt record {
#         icrc2 = true;
#       };
#     }
#   })
# '

# Deploy local icp
# dfx identity new minter --storage-mode plaintext
# dfx identity use minter
# export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
# dfx identity use default
# export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)

# dfx deploy icp_ledger_canister --argument '
#   (variant {
#     Init = record {
#       minting_account = "'$(dfx --identity minter ledger account-id)'";
#       initial_values = vec {
#         record {
#           "'$(dfx --identity default ledger account-id)'";
#           record {
#             e8s = 10_000_000_000 : nat64;
#           };
#         };
#       };
#       send_whitelist = vec {};
#       transfer_fee = opt record {
#         e8s = 10_000 : nat64;
#       };
#       token_symbol = opt "LICP";
#       token_name = opt "Local ICP";
#     }
#   })
# '

dfx deploy icrc7 --specified-id fjqb7-6qaaa-aaaak-qc7gq-cai --argument '(record{                                 
minting_account = opt record {
   owner = principal "xj2l7-vyaaa-aaaap-abl4a-cai";                                    
   subaccount = opt blob "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";
 };             
icrc7_supply_cap = null;
icrc7_description = opt "The official Ebook NFT collection of the UncensoredGreats Project.";
tx_window = opt 86_400;
permitted_drift = opt 100;
icrc7_max_take_value = opt 100;
icrc7_max_memo_size = opt 256;
icrc7_symbol = "UCG";
icrc7_max_update_batch_size = opt 10;
icrc7_max_query_batch_size = opt 5;
icrc7_atomic_batch_transfers = opt true;
icrc7_default_take_value = opt 20;
icrc7_logo = null;
icrc7_name = "UncensoredGreats";
approval_init = null;
archive_init = null
})'


dfx deploy icrc7_archive --specified-id forhl-tiaaa-aaaak-qc7ga-cai --argument '(
  record {
    max_records = 1_000 : nat;
    index_type = variant { Stable };
    first_index = 1 : nat;
    max_pages = 100 : nat;
  },
)'


# Step 5: Deploy other canisters with specified IDs
dfx deploy bookmarks --specified-id sklez-7aaaa-aaaan-qlrva-cai
dfx deploy alex_backend --specified-id xj2l7-vyaaa-aaaap-abl4a-cai

cd ./.dfx/
rm -rf local/canisters/
cp -r ic/canisters/ local/
cd ..

mkdir -p .dfx/local/canisters/icp_ledger_canister
curl https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icp_ledger/ledger.did -o .dfx/local/canisters/icp_ledger_canister/icp_ledger_canister.did

dfx deploy alex_frontend --specified-id xo3nl-yaaaa-aaaap-abl4q-cai