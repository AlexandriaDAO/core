#!/bin/bash

# Step 1: Start dfx
dfx stop
dfx start --background --clean

# Step 2: Initialize DFX with Internet Identity
dfx deps pull
dfx deps init
dfx deps deploy
dfx deps deploy internet_identity

# # Step Misc: NFT stuff.
# cd src/NFT/examples/ucg_nft
# cargo build --release --target wasm32-unknown-unknown --package ucg_nft
# candid-extractor target/wasm32-unknown-unknown/release/ucg_nft.wasm > src/NFT/examples/ucg_nft/ucg_nft.did


# Step 3: Configure Local Identities
dfx identity new minter --storage-mode plaintext
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export MINTER_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

# Step 4: Deploy the ICRC Ledger with LBRY and UCG tokens
dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '
  (variant {
    Init = record {
      token_name = "LBRYs";
      token_symbol = "LBRY";
      minting_account = record {
        owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
          };
          100_000_000_000;
        };
      };
      metadata = vec {};
      transfer_fee = 10_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
'

dfx deploy UCG --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '
  (variant {
    Init = record {
      token_name = "UncensoredGreats Token";
      token_symbol = "UCG";
      minting_account = record {
        owner = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "'${DEFAULT_ACCOUNT_PRINCIPAL}'";
          };
          100_000_000_000;
        };
      };
      metadata = vec {};
      transfer_fee = 10_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'${MINTER_ACCOUNT_PRINCIPAL}'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
'

dfx deploy icrc7 --argument '(record{                                 
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


# Step 5: Deploy other canisters with specified IDs
dfx deploy ucg_backend --specified-id xj2l7-vyaaa-aaaap-abl4a-cai
dfx deploy bookmarks --specified-id sklez-7aaaa-aaaan-qlrva-cai
dfx deploy icp_swap --specified-id 5qx27-tyaaa-aaaal-qjafa-cai
dfx deploy librarians --specified-id ju4sh-3yaaa-aaaap-ahapa-cai
dfx deploy ucg_frontend --specified-id xo3nl-yaaaa-aaaap-abl4q-cai
