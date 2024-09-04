#so for some reason the controlling principal being saved is to icrc7_deployer for some weird reason.

set -ex

dfx identity new alice --storage-mode=plaintext || true

dfx identity use alice

ALICE_PRINCIPAL=$(dfx identity get-principal)

dfx identity new bob --storage-mode=plaintext || true

dfx identity use bob

BOB_PRINCIPAL=$(dfx identity get-principal)

dfx identity use default

ADMIN_PRINCIPAL=$(dfx identity get-principal)


# # Deploy the canister without icrc3 & 37
dfx deploy icrc7 --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' -y --mode reinstall

ICRC7_CANISTER=$(dfx canister id icrc7)


echo $ICRC7_CANISTER

#init the canister
dfx canister call icrc7 init

# Mint 1 NFT.
dfx canister call icrc7 icrcX_mint "(
  vec {
    record {
      token_id = 0 : nat;
      owner = opt record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null;};
      metadata = variant {
        Class = vec {
          record {
            value = variant {
              Text = \"https://images-assets.nasa.gov/image/PIA18249/PIA18249~orig.jpg\"
            };
            name = \"icrc7:metadata:uri:asset\";
            immutable = true;
          };
          record {
            value = variant {
              Text = \"false\"
            };
            name = \"icrc7:metadata:verified\";
            immutable = false;
          };
        }
      };
      override = true;
    };
  },
)"


#Get token metadta
dfx canister call icrc7 icrc7_token_metadata '(vec {0})' --query 


# Change token metadata
dfx canister call icrc7 icrcX_mint "(
  vec {
    record {
      token_id = 0 : nat;
      owner = opt record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null;};
      metadata = variant {
        Class = vec {
          record {
            value = variant {
              Text = \"https://images-assets.nasa.gov/image/PIA18249/PIA18249~orig.jpg\"
            };
            name = \"icrc7:metadata:uri:asset\";
            immutable = true;
          };
          record {
            value = variant {
              Text = \"true\"
            };
            name = \"icrc7:metadata:verified\";
            immutable = true;
          };
        }
      };
      override = true;
    };
  },
)"

#Get token metadata
dfx canister call icrc7 icrc7_token_metadata '(vec {0})' --query 

# Get the owner
dfx canister call icrc7 icrc7_owner_of '(vec {0;1})' --query

# Check if the admin is approved to send the token:
dfx canister call icrc7 icrc37_is_approved "(vec{record { spender=record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0;}})" --query

# Send to admin from Bob.
dfx canister call icrc7 icrc37_transfer_from "(vec {record { 
  spender = principal \"$BOB_PRINCIPAL\";
  from = record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null}; 
  to = record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null};
  token_id = 0 : nat;
  memo = null;
  created_at_time = null;}})"

# See that it sent to Bob
dfx canister call icrc7 icrc7_owner_of '(vec {0;1})' --query

# Burn the token: 
dfx canister call icrc7 icrcX_burn '(record { tokens = vec {0} })'



# Mint a second token: 
dfx canister call icrc7 icrcX_mint "(
  vec {
    record {
      token_id = 2 : nat;
      owner = opt record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null;};
      metadata = variant {
        Class = vec {
          record {
            value = variant {
              Text = \"https://images-assets.nasa.gov/image/PIA18249/PIA18249~orig.jpg\"
            };
            name = \"icrc7:metadata:uri:transactionId\";
            immutable = true;
          };
          record {
            value = variant {
              Text = \"false\"
            };
            name = \"icrc7:metadata:verified\";
            immutable = false;
          };
        }
      };
      override = true;
    };
  },
)"


# Burn a second token 
dfx canister call icrc7 icrcX_burn '(record { tokens = vec {2} })'


