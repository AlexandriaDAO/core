# #!/bin/bash
# set -x 

# echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

# # (Re)Start dfx
# dfx stop
# dfx start --background --clean
# cp dfx_mainnet.json dfx.json
# # If mops or npm packages are inaccessible: export PATH="/home/<your-username>/.npm-global/bin:$PATH"

# # Step 1: Deploy NFT Stuff

# dfx canister create icrc7 --specified-id 53ewn-qqaaa-aaaap-qkmqq-cai
# dfx build icrc7
# dfx canister update-settings icrc7 --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai --network ic

# dfx canister create icrc7_scion --specified-id uxyan-oyaaa-aaaap-qhezq-cai
# dfx build icrc7_scion
# dfx canister update-settings icrc7_scion --add-controller 5sh5r-gyaaa-aaaap-qkmra-cai --network ic

# cargo build --release --target wasm32-unknown-unknown --package nft_manager
# candid-extractor target/wasm32-unknown-unknown/release/nft_manager.wasm > src/nft_manager/nft_manager.did

# dfx deploy nft_manager --network ic

# # Step 2: Deploy backend logic canisters.

# # For alex_backend
# cargo build --release --target wasm32-unknown-unknown --package alex_backend
# candid-extractor target/wasm32-unknown-unknown/release/alex_backend.wasm > src/alex_backend/alex_backend.did
# # For user
# cargo build --release --target wasm32-unknown-unknown --package user
# candid-extractor target/wasm32-unknown-unknown/release/user.wasm > src/user/user.did
# # For bookmarks
# cargo build --release --target wasm32-unknown-unknown --package bookmarks
# candid-extractor target/wasm32-unknown-unknown/release/bookmarks.wasm > src/bookmarks/bookmarks.did
# For icp_swap
# cargo build --release --target wasm32-unknown-unknown --package icp_swap
# candid-extractor target/wasm32-unknown-unknown/release/icp_swap.wasm > src/icp_swap/icp_swap.did
# # For tokenomics
# cargo build --release --target wasm32-unknown-unknown --package tokenomics
# candid-extractor target/wasm32-unknown-unknown/release/tokenomics.wasm > src/tokenomics/tokenomics.did
# # For vetkd
# cargo build --release --target wasm32-unknown-unknown --package vetkd
# candid-extractor target/wasm32-unknown-unknown/release/vetkd.wasm > src/vetkd/vetkd.did
# # for logs
# cargo build --release --target wasm32-unknown-unknown --package logs
# candid-extractor target/wasm32-unknown-unknown/release/logs.wasm > src/logs/logs.did
# # For Emporium
# cargo build --release --target wasm32-unknown-unknown --package emporium
# candid-extractor target/wasm32-unknown-unknown/release/emporium.wasm > src/emporium/emporium.did


# dfx deploy alex_backend --network ic
# dfx deploy user --network ic
# dfx deploy bookmarks --network ic
# dfx deploy system_api --network ic
# dfx deploy icp_swap --network ic
# dfx deploy tokenomics --network ic
# dfx deploy vetkd --network ic
# dfx deploy logs --network ic
# dfx deploy emporium --network ic

# # The one azle canister:
# dfx deploy alex_wallet --network ic

# # # Step 3: Deploy FTs (ALEX & LBRY).''
# # export ALEX_LOGO="PHN2ZyB3aWR0aD0iNTYwIiBoZWlnaHQ9IjU2MCIgdmlld0JveD0iMCAwIDU2MCA1NjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1NjAiIGhlaWdodD0iNTYwIiByeD0iNTAiIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDU2MCAwKSIgZmlsbD0iIzM1MzUzNSIvPgo8cGF0aCBkPSJNMTc5LjMxNyAzMTEuMjVMMTYzLjc2NSAzNTIuNTk4TDE0OC4yMTIgMzkzLjk0NEwxMTcuMTA4IDQ3Ni42MzlIMTYzLjQ5MkwxOTMuODY0IDM5Mi41TDIwMS40NzQgMzcyLjE4OEwyMDkuMDg0IDM1MS44NzVMMzMzLjg4OCAzNDIuNUwxNzkuMzE3IDMxMS4yNVpNMzk1Ljk2MSA0MzkuMTA0QzM5OC41MDggNDQ2LjU3NCAzOTguODczIDQ1Mi45MjMgMzk3LjA1MyA0NTguMTUxQzM5NS4yMzQgNDYzLjM4IDM5Mi4zMjQgNDY3LjQ4OSAzODguMzIyIDQ3MC40NzZDMzgzLjk1NiA0NzMuMDkgMzc5LjU5MSA0NzQuMzk3IDM3NS4yMjUgNDc0LjM5N0gzNzAuMzE0VjQ4MEg0ODBWNDc0LjM5N0M0ODAgNDc0LjM5NyA0NzkuMDkgNDc0LjM5NyA0NzcuMjcxIDQ3NC4zOTdDNDc1LjgxNiA0NzQuMzk3IDQ3NS4wODggNDc0LjM5NyA0NzUuMDg4IDQ3NC4zOTdDNDY2LjcyMSA0NzQuMzk3IDQ1OC4xNzIgNDcxLjc4NCA0NDkuNDQxIDQ2Ni41NTVDNDQwLjM0NSA0NjAuOTUzIDQzMi44ODcgNDUxLjgwMiA0MjcuMDY3IDQzOS4xMDRIMzk1Ljk2MVpNMTc5LjMxNyAzMTEuMjVMMjgyLjI4NSAxNDEuNjZMMjkwLjg0NiAxNjQuMTA0TDMwNy45NjYgMjA4Ljk5MUwzNDIuMjEgMjk4Ljc2OEw0MTAuNjk1IDQ3OC4zMTlINDQzLjQzOEwzMDMuNzM4IDEzNy43MDJDMzAzLjczOCAxMzcuNzAyIDMwMi44MjggMTM1LjQ2MiAzMDEuMDA5IDEzMC45OEMyOTguODI2IDEyNi4xMjUgMjk2LjQ2MSAxMjAuMzM2IDI5My45MTUgMTEzLjYxNEMyOTEuMDA1IDEwNi44OTEgMjg4LjYzOSAxMDAuMzU1IDI4Ni44MjIgOTQuMDA1QzI4NC42MzggODcuNjU2MyAyODMuNTQ2IDgyLjk4NzUgMjgzLjU0NiA4MEwyMzEuNDMyIDE5NS42MjVMMTc5LjMxNyAzMTEuMjVaTTE3Ny4xMzUgNDM5LjEwNEgxMzIuMzg3QzEyNi45MyA0NTEuODAyIDExOS42NTQgNDYwLjk1MyAxMTAuNTU5IDQ2Ni41NTVDMTAxLjQ2NCA0NzEuNzg0IDkyLjczMjUgNDc0LjM5NyA4NC4zNjUxIDQ3NC4zOTdDODQuMzY1MSA0NzQuMzk3IDgzLjYzNyA0NzQuMzk3IDgyLjE4MiA0NzQuMzk3QzgwLjcyNyA0NzQuMzk3IDgwIDQ3NC4zOTcgODAgNDc0LjM5N1Y0ODBIMjAyLjc4M1Y0NzQuMzk3SDE5Ny44NzFDMTkwLjk1OSA0NzQuMzk3IDE4NC43NzUgNDcxLjQxIDE3OS4zMTcgNDY1LjQzNEMxNzMuODYgNDU5LjA4NSAxNzMuMTMzIDQ1MC4zMDcgMTc3LjEzNSA0MzkuMTA0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==";
# # export LBRY_LOGO="PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX9Cw0YBfMSIgZGF0YS1uYW1lPSLQqNCw0YAgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTIwMCAxMjAwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZmZmOwogICAgICAgIGZpbGwtcnVsZTogZXZlbm9kZDsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiAjMzUzNTM1OwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik02MDAsMGgwYzMzMS4zNywwLDYwMCwyNjguNjMsNjAwLDYwMGgwYzAsMzMxLjM3LTI2OC42Myw2MDAtNjAwLDYwMGgwQzI2OC42MywxMjAwLDAsOTMxLjM3LDAsNjAwSDBDMCwyNjguNjMsMjY4LjYzLDAsNjAwLDBaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNODEzLjY5LDcyNC40NWwtMjcuMzctNzAuODgtOTEuNzItMTk4LjIxLTkxLjcyLTE5OC4yMWMwLDUuMTItMS45MiwxMy4xMy01Ljc2LDI0LjAxLTMuMiwxMC44OS03LjM2LDIyLjA5LTEyLjQ5LDMzLjYxLTQuNDgsMTEuNTItOC42NCwyMS40NS0xMi40OCwyOS43N2wtNC44LDExLjUyLTIwMi4wMyw0NzYuNTcsMjM5Ljc4LTQ2OS43OSwxMjguODMsMzYwLjM3LDEzLjM5LDM0LjgyLDEzLjM5LDM0LjgyLDI5LjYxLDc5Ljg5aC0uMTZjNy4wNCwxOS4yMSw1Ljc2LDM0LjI1LTMuODQsNDUuMTQtOS42LDEwLjI0LTIwLjQ5LDE1LjM3LTMyLjY1LDE1LjM3aC04LjY0djkuNmgyMTYuMDl2LTkuNmgtNy42OGMtMTQuNzMsMC0zMC4wOS00LjQ4LTQ2LjEtMTMuNDQtMTEuODctNy4xMi0yMS45OC0xNy41OC0zMC4zMi0zMS4zOWwtMzUuOTUtOTMuMDktMjcuMzctNzAuODhabS00NjMuMjksMTQzLjRjMC0xLjAxLS4yNi0uNDYsMCwwbC0zLjM0LDExLjQxYy05LjcyLDE4LjQxLTIxLjc2LDMxLjkyLTM2LjEyLDQwLjU0LTE1LjM3LDguOTYtMzAuNDEsMTMuNDQtNDUuMTQsMTMuNDRoLTguNjR2OS42aDE5My4wNHYtOS42aC04LjY0Yy0xLDAtMi41NywuMDktNC41OCwuMjEtMTMuNTUsLjc4LTQ3LjQzLDIuNzQtNjUuMTMtMTMuNjUtMTEuNjgtMTAuODEtMTYuMzMtMjguMjMtMTkuMzQtMzkuNTItLjgxLTMuMDQtMS40MS0xMC41My0yLjA5LTEyLjQzWiIvPgo8L3N2Zz4=";

# # dfx deploy LBRY --network ic --argument '(variant { Init = 
# # record {
# #      token_symbol = "LBRY";
# #      token_name = "LBRY";
# #      minting_account = record { owner = principal "'$(dfx canister id icp_swap --network ic)'" };
# #      transfer_fee = 4_000_000;
# #      metadata = vec {
# #         record { "icrc1:symbol"; variant { Text = "LBRY" } };
# #         record { "icrc1:name"; variant { Text = "LBRY" } };
# #         record { "icrc1:description"; variant { Text = "The Secondary Token of Alexandria" } };
# #         record { "icrc1:decimals"; variant { Nat = 8 } };
# #         record { "icrc1:fee"; variant { Nat = 4_000_000 } };
# #         record { "icrc1:logo"; variant { Text = "data:image/svg+xml;base64,'${TOKEN_LOGO}'" } };
# #      };
# #      initial_balances = vec {};
# #      archive_options = record {
# #          num_blocks_to_archive = 3000;
# #          trigger_threshold = 6000;
# #          controller_id = principal "'$(dfx canister id icp_swap --network ic)'";
# #          cycles_for_archive_creation = opt 10000000000000;
# #      };
# #      feature_flags = opt record {
# #         icrc2 = true;
# #         icrc3 = true;
# #      };
# #      maximum_number_of_accounts = opt 10_000_000;
# #      accounts_overflow_trim_quantity = opt 100_000;
# #      max_memo_length = opt 32;
# #  }
# # })'


# dfx deploy ALEX --network ic --argument '(variant { Init = 
# record {
#      token_symbol = "ALEX";
#      token_name = "ALEX";
#      minting_account = record { owner = principal "'$(dfx canister id tokenomics --network ic)'" };
#      transfer_fee = 10_000;
#      metadata = vec {
#         record { "icrc1:symbol"; variant { Text = "ALEX" } };
#         record { "icrc1:name"; variant { Text = "ALEX" } };
#         record { "icrc1:description"; variant { Text = "The Primary Token of Alexandria" } };
#         record { "icrc1:decimals"; variant { Nat = 8 } };
#         record { "icrc1:fee"; variant { Nat = 10_000 } };
#         record { "icrc1:logo"; variant { Text = "data:image/svg+xml;base64,'${TOKEN_LOGO}'" } };
#      };
#      initial_balances = vec {};
#      archive_options = record {
#          num_blocks_to_archive = 3000;
#          trigger_threshold = 6000;
#          controller_id = principal "'$(dfx canister id tokenomics --network ic)'";
#          cycles_for_archive_creation = opt 10000000000000;
#      };
#      feature_flags = opt record {
#         icrc2 = true;
#         icrc3 = true;
#      };
#      maximum_number_of_accounts = opt 10_000_000;
#      accounts_overflow_trim_quantity = opt 100_000;
#      max_memo_length = opt 32;
#  }
# })'


# # # opt 300000000000; /* 5 minutes */
# # # opt 604800000000000; /* 1 week */
# # dfx deploy ic_siwe_provider --argument $'(
# #     record {
# #         domain = "127.0.0.1";
# #         uri = "http://127.0.0.1:4943";
# #         salt = "secretsalt000";
# #         chain_id = opt 1;
# #         scheme = opt "http";
# #         statement = opt "Login to the Alexandria";
# #         sign_in_expires_in = opt 300000000000;
# #         session_expires_in = opt 604800000000000;
# #         targets = opt vec {
# #             "'$(dfx canister id ic_siwe_provider --network ic)'";
# #             "'$(dfx canister id nft_manager --network ic)'";
# #             "'$(dfx canister id user --network ic)'";
# #         };
# #     }
# # )' --network ic

# # dfx deploy ic_siws_provider --argument $'(
# #     record {
# #         domain = "127.0.0.1";
# #         uri = "http://127.0.0.1:4943";
# #         salt = "secretsalt000";
# #         chain_id = opt "mainnet";
# #         scheme = opt "http";
# #         statement = opt "Login to the Alexandria";
# #         sign_in_expires_in = opt 300000000000;
# #         session_expires_in = opt 604800000000000;
# #         targets = opt vec {
# #             "'$(dfx canister id ic_siws_provider --network ic)'";
# #             "'$(dfx canister id nft_manager --network ic)'";
# #             "'$(dfx canister id user --network ic)'";
# #         };
# #     }
# # )' --network ic


# # # Exit and deploy frontend manually.
# # echo "Backend canisters finished. Copy and paste remainder of the build script manually to deploy on the network."
# # exit 1

# # # You may need to run these manually based on sytem level access controls.
# cd ./.dfx/
# rm -rf local/canisters/
# cp -r ic/canisters/ local/
# cd ..

# # cp .dfx/ic/canisters/alex_frontend/assetstorage.did .dfx/local/canisters/alex_frontend/
# mkdir -p .dfx/local/canisters/LBRY
# mkdir -p .dfx/local/canisters/ALEX
# mkdir -p .dfx/local/canisters/alex_frontend/

# wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/ALEX/ALEX.did
# wget https://raw.githubusercontent.com/dfinity/ic/b9a0f18dd5d6019e3241f205de797bca0d9cc3f8/rs/rosetta-api/icrc1/ledger/ledger.did -O .dfx/local/canisters/LBRY/LBRY.did

# npm i
# # dfx deploy alex_frontend --network ic
