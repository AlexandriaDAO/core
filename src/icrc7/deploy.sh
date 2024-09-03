set -ex

dfx identity new alice --storage-mode=plaintext || true

dfx identity use alice

ALICE_PRINCIPAL=$(dfx identity get-principal)

dfx identity new bob --storage-mode=plaintext || true

dfx identity use bob

BOB_PRINCIPAL=$(dfx identity get-principal)

dfx identity new icrc7_deployer --storage-mode=plaintext || true

dfx identity use icrc7_deployer

ADMIN_PRINCIPAL=$(dfx identity get-principal)



#Deploy the canister
dfx deploy icrc7 --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' --mode reinstall

ICRC7_CANISTER=$(dfx canister id icrc7)


echo $ICRC7_CANISTER

#init the canister
dfx canister call icrc7 init

# Get Name
dfx canister call icrc7 icrc7_name  --query 

# Get Symbol
dfx canister call icrc7 icrc7_symbol  --query 

# Get Description
dfx canister call icrc7 icrc7_description  --query 

# Get Logo
dfx canister call icrc7 icrc7_logo  --query 

# Mint 4 NFTs
dfx canister call icrc7 icrcX_mint "(
  vec {
    record {
      token_id = 0 : nat;
      owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
      metadata = variant {
        Map = vec {
          record { \"icrc97:metadata\"; variant { Map = vec {
            record { \"name\"; variant { Text = \"Image 1\" } };
            record { \"description\"; variant { Text = \"A beautiful space image from NASA.\" } };
            record { \"assets\"; variant { Array = vec {
              variant { Map = vec {
                record { \"url\"; variant { Text = \"https://images-assets.nasa.gov/image/PIA18249/PIA18249~orig.jpg\" } };
                record { \"mime\"; variant { Text = \"image/jpeg\" } };
                record { \"purpose\"; variant { Text = \"icrc97:image\" } }
              }}
            }}}
          }}}
        }
      };
      memo = opt blob \"\00\01\";
      override = true;
      created_at_time = null;
    };
    record {
      token_id = 1 : nat;
      owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
      metadata = variant {
        Map = vec {
          record { \"icrc97:metadata\"; variant { Map = vec {
            record { \"name\"; variant { Text = \"Image 2\" }};
            record { \"description\"; variant { Text = \"Another stunning NASA image.\" } };
            record { \"assets\"; variant { Array = vec {
              variant { Map = vec {
                record { \"url\"; variant { Text = \"https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg\" } };
                record { \"mime\"; variant { Text = \"image/jpeg\" } };
                record { \"purpose\"; variant { Text = \"icrc97:image\" } }
              }}
            }}}
          }}}
        }
      };
      memo = opt blob \"\00\01\";
      override = true;
      created_at_time = null;
    };
    record {
      token_id = 2 : nat;
      owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
      metadata = variant {
        Map = vec {
          record { \"icrc97:metadata\"; variant { Map = vec {
            record { \"name\"; variant { Text = \"Image 3\" } };
            record { \"description\"; variant { Text = \"Hubble sees the wings of a butterfly.\" } };
            record { \"assets\"; variant { Array = vec {
              variant { Map = vec {
                record { \"url\"; variant { Text = \"https://images-assets.nasa.gov/image/hubble-sees-the-wings-of-a-butterfly-the-twin-jet-nebula_20283986193_o/hubble-sees-the-wings-of-a-butterfly-the-twin-jet-nebula_20283986193_o~orig.jpg\" } };
                record { \"mime\"; variant { Text = \"image/jpeg\" } };
                record { \"purpose\"; variant { Text = \"icrc97:image\" } }
              }}
            }}}
          }}}
        }
      };
      memo = opt blob \"\00\01\";
      override = true;
      created_at_time = null;
    };
    record {
      token_id = 3 : nat;
      owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
      metadata = variant {
        Map = vec {
          record { \"icrc97:metadata\"; variant { Map = vec {
            record { \"name\"; variant { Text = \"Image 4\" } };
            record { \"description\"; variant { Text = \"Another beautiful image from NASA archives.\" } };
            record { \"assets\"; variant { Array = vec {
              variant { Map = vec {
                record { \"url\"; variant { Text = \"https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001518/GSFC_20171208_Archive_e001518~orig.jpg\" } };
                record { \"mime\"; variant { Text = \"image/jpeg\" } };
                record { \"purpose\"; variant { Text = \"icrc97:image\" } }
              }}
            }}}
          }}}
        }
      };
      memo = opt blob \"\00\01\";
      override = true;
      created_at_time = null;
    };
  }
)"

# Get total supply
dfx canister call icrc7 icrc7_total_supply  --query 

# Get supply cap
dfx canister call icrc7 icrc7_supply_cap  --query

# Get max query batch size
dfx canister call icrc7 icrc7_max_query_batch_size  --query

# Get max update size
dfx canister call icrc7 icrc7_max_update_batch_size  --query

# Get default take value
dfx canister call icrc7 icrc7_default_take_value  --query

# Get max take value
dfx canister call icrc7 icrc7_max_take_value  --query

# Get max memo size
dfx canister call icrc7 icrc7_max_memo_size  --query

# Get collection metadata
dfx canister call icrc7 icrc7_collection_metadata  --query

# Get suported standards
dfx canister call icrc7 icrc10_supported_standards  --query


# Get max approvals per token or collection
dfx canister call icrc7 icrc37_max_approvals_per_token_or_collection  --query

#Get a max revoke approvals
dfx canister call icrc7 icrc37_max_revoke_approvals '(null, null)'

#All tokens should be owned by the canister
dfx canister call icrc7 icrc7_tokens_of "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null,null)"

#Should be approved to transfer
dfx canister call icrc7 icrc37_is_approved "(vec{record { spender=record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0;}})" --query

#Check that the owner is spender
dfx canister call icrc7 icrc37_get_collection_approvals "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null, null)" --query

#tranfer from a token to the admin
dfx canister call icrc7 icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null};
  token_id =  0 : nat;
  memo = null;
  created_at_time = null;}})"

#Internally use transfer to transfer to admin
dfx canister call icrc7 assign "(1, record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null})";

# Admin should own two tokens

dfx canister call icrc7 icrc7_tokens_of "(record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}, null, null)" --query

# List owner of all tokens
dfx canister call icrc7 icrc7_owner_of '(vec {0;1})' --query

#Get token metadta
dfx canister call icrc7 icrc7_token_metadata '(vec {0})' --query 

# Approve Alice to spend token 0
dfx canister call icrc7 icrc37_approve_tokens "(vec {record { token_id=0; approval_info= record {from_subaccount = null; spender = record {owner = principal \"$ALICE_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

# Retrieve Alice Token approvals
dfx canister call icrc7 icrc37_is_approved "(vec { record {spender= record { owner = principal \"$ALICE_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0}})" --query

dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

# Switch to Alice
dfx identity use alice

# Transfer to Bob
dfx canister call icrc7 icrc37_transfer_from "(vec {record { 
  spender = principal \"$ALICE_PRINCIPAL\";
  from = record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; 
  to = record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null};
  token_id = 0 : nat;
  memo = null;
  created_at_time = null;}})"

#Switch to Bob
dfx identity use bob

#Let bob approve the collection for admin
dfx canister call icrc7 icrc37_approve_collection "(vec {record { approval_info = record {from_subaccount = null; spender = record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

dfx canister call icrc7 icrc37_get_collection_approvals "(record{owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null} ,null, null)" --query

#Revoke the approval
dfx canister call icrc7 icrc37_revoke_collection_approvals "(vec {record {
  from_subaccount = null;
  spender = null;
  memo = null;
  created_at_time = null;
}})" 

#Check it is removed

#approve the token for admin
dfx canister call icrc7 icrc37_approve_tokens "(vec{record { token_id=0; approval_info = record {from_subaccount = null; spender = record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

#Revoke the approval
dfx canister call icrc7 icrc37_revoke_token_approvals "(vec{record {
  token_id = 0;
  from_subaccount = null;
  spender = null;
  memo = null;
  created_at_time = null;
}})" 

#Check it is removed
dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

#Get the transaction log
dfx canister call icrc7 icrc3_get_blocks "(vec {record {start =0; length = 1000}})" --query

#Get the archive log
dfx canister call icrc7 icrc3_get_archives "(record {from = null})" --query
















# # OG Before Double Transfer Bug Error fix:

# set -ex

# dfx identity new alice --storage-mode=plaintext || true

# dfx identity use alice

# ALICE_PRINCIPAL=$(dfx identity get-principal)

# dfx identity new bob --storage-mode=plaintext || true

# dfx identity use bob

# BOB_PRINCIPAL=$(dfx identity get-principal)

# dfx identity new icrc7_deployer --storage-mode=plaintext || true

# dfx identity use icrc7_deployer

# ADMIN_PRINCIPAL=$(dfx identity get-principal)



# #Deploy the canister
# dfx deploy icrc7 --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' --mode reinstall

# ICRC7_CANISTER=$(dfx canister id icrc7)


# echo $ICRC7_CANISTER

# #init the canister
# dfx canister call icrc7 init

# # Get Name
# dfx canister call icrc7 icrc7_name  --query 

# # Get Symbol
# dfx canister call icrc7 icrc7_symbol  --query 

# # Get Description
# dfx canister call icrc7 icrc7_description  --query 

# # Get Logo
# dfx canister call icrc7 icrc7_logo  --query 

# # Mint 4 NFTs
# dfx canister call icrc7 icrcX_mint "(
#   vec {
#     record {
#       token_id = 0 : nat;
#       owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
#       metadata = variant {
#         Class = vec {
#           record {
#             value = variant {
#               Text = \"https://images-assets.nasa.gov/image/PIA18249/PIA18249~orig.jpg\"
#             };
#             name = \"icrc7:metadata:uri:image\";
#             immutable = true;
#           };
#         }
#       };
#       memo = opt blob \"\00\01\";
#       override = true;
#       created_at_time = null;
#     };
#     record {
#       token_id = 1 : nat;
#       owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
#       metadata = variant {
#         Class = vec {
#           record {
#             value = variant {
#               Text = \"https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg\"
#             };
#             name = \"icrc7:metadata:uri:image\";
#             immutable = true;
#           };
#         }
#       };
#       memo = opt blob \"\00\01\";
#       override = true;
#       created_at_time = null;
#     };
#     record {
#       token_id = 2 : nat;
#       owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
#       metadata = variant {
#         Class = vec {
#           record {
#             value = variant {
#               Text = \"https://images-assets.nasa.gov/image/hubble-sees-the-wings-of-a-butterfly-the-twin-jet-nebula_20283986193_o/hubble-sees-the-wings-of-a-butterfly-the-twin-jet-nebula_20283986193_o~orig.jpg\"
#             };
#             name = \"icrc7:metadata:uri:image\";
#             immutable = true;
#           };
#         }
#       };
#       memo = opt blob \"\00\01\";
#       override = true;
#       created_at_time = null;
#     };
#     record {
#       token_id = 3 : nat;
#       owner = opt record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;};
#       metadata = variant {
#         Class = vec {
#           record {
#             value = variant {
#               Text = \"https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001518/GSFC_20171208_Archive_e001518~orig.jpg\"
#             };
#             name = \"icrc7:metadata:uri:image\";
#             immutable = false;
#           };
#         }
#       };
#       memo = opt blob \"\00\01\";
#       override = true;
#       created_at_time = null;
#     };
#   },
# )"



# # Get total supply
# dfx canister call icrc7 icrc7_total_supply  --query 

# # Get supply cap
# dfx canister call icrc7 icrc7_supply_cap  --query

# # Get max query batch size
# dfx canister call icrc7 icrc7_max_query_batch_size  --query

# # Get max update size
# dfx canister call icrc7 icrc7_max_update_batch_size  --query

# # Get default take value
# dfx canister call icrc7 icrc7_default_take_value  --query

# # Get max take value
# dfx canister call icrc7 icrc7_max_take_value  --query

# # Get max memo size
# dfx canister call icrc7 icrc7_max_memo_size  --query

# # Get collection metadata
# dfx canister call icrc7 icrc7_collection_metadata  --query

# # Get suported standards
# dfx canister call icrc7 icrc10_supported_standards  --query


# # Get max approvals per token or collection
# dfx canister call icrc7 icrc37_max_approvals_per_token_or_collection  --query

# #Get a max revoke approvals
# dfx canister call icrc7 icrc37_max_revoke_approvals '(null, null)'

# #All tokens should be owned by the canister
# dfx canister call icrc7 icrc7_tokens_of "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null,null)"

# #Should be approved to transfer
# dfx canister call icrc7 icrc37_is_approved "(vec{record { spender=record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0;}})" --query

# #Check that the owner is spender
# dfx canister call icrc7 icrc37_get_collection_approvals "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null, null)" --query

# #tranfer from a token to the admin
# dfx canister call icrc7 icrc37_transfer_from "(vec{record { 
#   spender = principal \"$ADMIN_PRINCIPAL\";
#   from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
#   to = record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null};
#   token_id =  0 : nat;
#   memo = null;
#   created_at_time = null;}})"

# #Internally use transfer to transfer to admin
# dfx canister call icrc7 assign "(1, record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null})";

# # Admin should own two tokens

# dfx canister call icrc7 icrc7_tokens_of "(record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}, null, null)" --query

# # List owner of all tokens
# dfx canister call icrc7 icrc7_owner_of '(vec {0;1})' --query

# #Get token metadta
# dfx canister call icrc7 icrc7_token_metadata '(vec {0})' --query 

# # Approve Alice to spend token 0
# dfx canister call icrc7 icrc37_approve_tokens "(vec {record { token_id=0; approval_info= record {from_subaccount = null; spender = record {owner = principal \"$ALICE_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

# # Retrieve Alice Token approvals
# dfx canister call icrc7 icrc37_is_approved "(vec { record {spender= record { owner = principal \"$ALICE_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0}})" --query

# dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

# # Switch to Alice
# dfx identity use alice

# # Transfer to Bob
# dfx canister call icrc7 icrc37_transfer_from "(vec {record { 
#   spender = principal \"$ALICE_PRINCIPAL\";
#   from = record { owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; 
#   to = record { owner = principal \"$BOB_PRINCIPAL\"; subaccount = null};
#   token_id = 0 : nat;
#   memo = null;
#   created_at_time = null;}})"

# #Switch to Bob
# dfx identity use bob

# #Let bob approve the collection for admin
# dfx canister call icrc7 icrc37_approve_collection "(vec {record { approval_info = record {from_subaccount = null; spender = record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

# dfx canister call icrc7 icrc37_get_collection_approvals "(record{owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null} ,null, null)" --query

# #Revoke the approval
# dfx canister call icrc7 icrc37_revoke_collection_approvals "(vec {record {
#   from_subaccount = null;
#   spender = null;
#   memo = null;
#   created_at_time = null;
# }})" 

# #Check it is removed

# #approve the token for admin
# dfx canister call icrc7 icrc37_approve_tokens "(vec{record { token_id=0; approval_info = record {from_subaccount = null; spender = record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null}; memo = null; expires_at = null; created_at_time = null }}})"

# dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

# #Revoke the approval
# dfx canister call icrc7 icrc37_revoke_token_approvals "(vec{record {
#   token_id = 0;
#   from_subaccount = null;
#   spender = null;
#   memo = null;
#   created_at_time = null;
# }})" 

# #Check it is removed
# dfx canister call icrc7 icrc37_get_token_approvals "(vec { 0;},null,null)" --query

# #Get the transaction log
# dfx canister call icrc7 icrc3_get_blocks "(vec {record {start =0; length = 1000}})" --query

# #Get the archive log
# dfx canister call icrc7 icrc3_get_archives "(record {from = null})" --query