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
cargo build --release --target wasm32-unknown-unknown --package ucg_nft
candid-extractor target/wasm32-unknown-unknown/release/ucg_nft.wasm > src/NFT/examples/ucg_nft/ucg_nft.did


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

# Step 5: Deploy other canisters with specified IDs
dfx deploy ugd_backend --specified-id xj2l7-vyaaa-aaaap-abl4a-cai
dfx deploy bookmarks --specified-id sklez-7aaaa-aaaan-qlrva-cai
dfx deploy icp_swap --specified-id 5qx27-tyaaa-aaaal-qjafa-cai
dfx deploy librarians --specified-id ju4sh-3yaaa-aaaap-ahapa-cai
dfx deploy ugd_frontend --specified-id xo3nl-yaaaa-aaaap-abl4q-cai
dfx deploy ucg_nft --specified-id fjqb7-6qaaa-aaaak-qc7gq-cai

# Step 6: Mint a UCG NFT:
dfx canister call ucg_nft create_token \
    "(record{
        token=record {
                name=\"test\";
                description=opt\"test description\"
        };
     })"
