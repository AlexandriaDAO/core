#!/bin/bash
set -x 

# Navigate to project root
cd "$(dirname "$0")/.."
echo "Current working directory: $(pwd)"

# Switch to mainnet deployment script.
cp dfx_mainnet.json dfx.json
# Note: ./dfx/local/canisters folder empties after this command, and will need to be regenerated manually with commands on the bottom of this script.

# (Re)Start dfx
dfx stop
dfx start --background --clean

# Configure Local Identities
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_PRINCIPAL=$(dfx identity get-principal)

# Deploy the LBRY and ALEX tokens
dfx deploy LBRY --specified-id hdtfn-naaaa-aaaam-aciva-cai --argument '
  (variant {
    Init = record {
      token_name = "LBRYs";
      token_symbol = "LBRY";
      minting_account = record {
        owner = principal "'5qx27-tyaaa-aaaal-qjafa-cai'";
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
      transfer_fee = 100_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'5qx27-tyaaa-aaaal-qjafa-cai'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
' --network ic

# Test transfer some LBRY
dfx canister call LBRY icrc1_transfer '(record {
  to = record {
    owner = principal "zzvai-vg3as-2ob6v-olrwr-ixgcm-uda5e-r3vz7-ijgk5-ry7gs-jk2gh-nqe";
  };
  from = record {
    owner = principal "2jgt7-v33z4-tiosh-csi2v-66cge-4uu7j-v2nye-z27vc-d36pc-ctqai-bqe";
  };
  amount = 100000000;
  fee = opt 100_000;
})' --network ic


dfx deploy ALEX --specified-id 7hcrm-4iaaa-aaaak-akuka-cai --argument '
  (variant {
    Init = record {
      token_name = "Alexandria";
      token_symbol = "ALEX";
      minting_account = record {
        owner = principal "'uxyan-oyaaa-aaaap-qhezq-cai'";
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
      transfer_fee = 100_000;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'uxyan-oyaaa-aaaap-qhezq-cai'";
      };
      feature_flags = opt record {
        icrc2 = true;
      };
    }
  })
' --network ic

# Test transfer some ALEX
dfx canister call ALEX icrc1_transfer '(record {
  to = record {
    owner = principal "zzvai-vg3as-2ob6v-olrwr-ixgcm-uda5e-r3vz7-ijgk5-ry7gs-jk2gh-nqe";
  };
  from = record {
    owner = principal "2jgt7-v33z4-tiosh-csi2v-66cge-4uu7j-v2nye-z27vc-d36pc-ctqai-bqe";
  };
  amount = 100000000;
  fee = opt 100_000;
})' --network ic


# If you want to reset the token canisters (will delete all token data). 
# dfx canister uninstall-code fjqb7-6qaaa-aaaak-qc7gq-cai --network ic
# dfx canister uninstall-code forhl-tiaaa-aaaak-qc7ga-cai --network ic


# Deploy NFTs
dfx deploy icrc7 --specified-id fjqb7-6qaaa-aaaak-qc7gq-cai --argument '(record{                                 
minting_account = opt record {
   owner = principal "xj2l7-vyaaa-aaaap-abl4a-cai";                                    
   subaccount = opt blob "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";
 };                 
icrc7_supply_cap = null;
icrc7_description = opt "The official Ebook NFT collection of the Alexandria Project.";
tx_window = opt 86_400;
permitted_drift = opt 100;
icrc7_max_take_value = opt 100;
icrc7_max_memo_size = opt 256;
icrc7_symbol = "ALEX";
icrc7_max_update_batch_size = opt 10;
icrc7_max_query_batch_size = opt 5;
icrc7_atomic_batch_transfers = opt true;
icrc7_default_take_value = opt 20;
icrc7_logo = null;
icrc7_name = "Alexandria";
approval_init = null;
archive_init= opt record {
        maxRecordsToArchive= 2;
        archiveIndexType= variant {Stable};
        maxArchivePages= 3;
        settleToRecords= 2;
        archiveCycles= 1000000000000;
        maxActiveRecords= 4;
        maxRecordsInArchiveInstance= 4;
        archiveControllers= null
    }
})' --network ic

# Deploy backend logic canisters.
dfx deploy alex_backend --network ic
dfx deploy bookmarks --network ic
dfx deploy icp_swap --network ic
dfx deploy tokenomics --network ic

# Exit and deploy frontend manually.
echo "Backend canisters finished. Copy and paste remainerd of the build script manually to deploy on the network."
exit 1

# You may need to run these manually based on sytem level access controls.
cd ./.dfx/
rm -rf local/canisters/
cp -r ic/canisters/ local/
cd ..

mkdir -p .dfx/local/canisters/LBRY
mkdir -p .dfx/local/canisters/ALEX

wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/ALEX/ALEX.did
wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/LBRY/LBRY.did

cp .dfx/ic/canisters/alex_frontend/assetstorage.did .dfx/local/canisters/alex_frontend/

npm i
dfx deploy alex_frontend --network ic
