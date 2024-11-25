# # Step 1: Start dfx
dfx stop
dfx start --background --clean


# Step 2: II Canister
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity


## xrc first because it's used in init functions of others.
dfx canister create xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai
cargo build --release --target wasm32-unknown-unknown --package xrc
candid-extractor target/wasm32-unknown-unknown/release/xrc.wasm > src/xrc/xrc.did
dfx deploy xrc --specified-id uf6dk-hyaaa-aaaaq-qaaaq-cai



# Step 5: Configure Local Identities for token launches
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx identity use user_1
export ALICE_ACCOUNT_ID=$(dfx ledger account-id)
export ALICE_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_2
export BOB_ACCOUNT_ID=$(dfx ledger account-id)
export BOB_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use user_3
export CHARLIE_ACCOUNT_ID=$(dfx ledger account-id)
export CHARLIE_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)


# # Step 6: Deploy the ICP & ICRC Ledger with LICP, LBRY, and ALEX tokens
# dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "  
#   (variant {  
#     Init = record {  
#       minting_account = \"$MINTER_ACCOUNT_ID\";  
#       initial_values = vec {  
#         record {  
#           \"$DEFAULT_ACCOUNT_ID\";  
#           record {  
#             e8s = 8_681_981_000_000_000 : nat64;  
#           };  
#           \"$ALICE_ACCOUNT_ID\";  
#           record {  
#             e8s = 1_000_000_000 : nat64;  
#           };
#           \"$BOB_ACCOUNT_ID\";
#           record {
#             e8s = 1_000_000_000 : nat64;
#           };
#           \"$CHARLIE_ACCOUNT_ID\";
#           record {
#             e8s = 1_000_000_000 : nat64;
#           };
#         };  
#       };  
#       send_whitelist = vec {};  
#       transfer_fee = opt record {  
#         e8s = 10_000 : nat64;  
#       };  
#       token_symbol = opt \"LICP\";  
#       token_name = opt \"Local ICP\";  
#     }  
#   })  
# "
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "  
  (variant {  
    Init = record {  
      minting_account = \"$MINTER_ACCOUNT_ID\";  
      initial_values = vec {  
        record {  
          \"$DEFAULT_ACCOUNT_ID\";  
          record {  
            e8s = 8_681_981_000_000_000 : nat64;  
          };  
        };
        record {  
          \"$ALICE_ACCOUNT_ID\";  
          record {  
            e8s = 1_000_000_000 : nat64;  
          };
        };
        record {
          \"$BOB_ACCOUNT_ID\";
          record {
            e8s = 1_000_000_000 : nat64;
          };
        };
        record {
          \"$CHARLIE_ACCOUNT_ID\";
          record {
            e8s = 1_000_000_000 : nat64;
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


dfx deploy LBRY --specified-id y33wz-myaaa-aaaap-qkmna-cai --argument '(variant { Init = 
record {
     token_symbol = "LBRY";
     token_name = "LBRY";
     minting_account = record { owner = principal "'$(dfx canister id icp_swap)'" };
     transfer_fee = 4_000_000;
     metadata = vec {};
     initial_balances = vec {};
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




dfx deploy ALEX --specified-id ysy5f-2qaaa-aaaap-qkmmq-cai --argument '(variant { Init = 
record {
     token_symbol = "ALEX";
     token_name = "ALEX";
     minting_account = record { owner = principal "'$(dfx canister id tokenomics)'" };
     transfer_fee = 10_000;
     metadata = vec {};
     initial_balances = vec {};
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


# For icp_swap
cargo build --release --target wasm32-unknown-unknown --package icp_swap
candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
# For tokenomics
cargo build --release --target wasm32-unknown-unknown --package tokenomics
candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
# for tests
cargo build --release --target wasm32-unknown-unknown --package tests
candid-extractor target/wasm32-unknown-unknown/release/tests.wasm > src/tests/tests.did

dfx deploy icp_swap --specified-id 54fqz-5iaaa-aaaap-qkmqa-cai
dfx deploy tokenomics --specified-id 5abki-kiaaa-aaaap-qkmsa-cai
dfx deploy tests --specified-id yn33w-uaaaa-aaaap-qpk5q-cai