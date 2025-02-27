!/bin/bash
# dfx canister snapshot list emporium --network ic

# # Load snapshot
# dfx canister stop alex_frontend --network ic
# dfx canister snapshot load alex_frontend 00000000000000080000000001f0531c0101 --network ic
# dfx canister start alex_frontend --network ic

set -x

dfx identity use mainnet

# ALEX

dfx canister stop ALEX --network ic
dfx canister snapshot create ALEX --network ic
dfx canister start ALEX --network ic

# LBRY
dfx canister stop LBRY --network ic
dfx canister snapshot create LBRY --network ic
dfx canister start LBRY --network ic

# alex_backend
dfx canister stop alex_backend --network ic
dfx canister snapshot create alex_backend --replace 00000000000000000000000001f0531b0101 --network ic
dfx canister start alex_backend --network ic

# alex_frontend
dfx canister stop alex_frontend --network ic
dfx canister snapshot create alex_frontend --replace 00000000000000080000000001f0531c0101 --network ic
dfx canister start alex_frontend --network ic

# alex_wallet
dfx canister stop alex_wallet --network ic
dfx canister snapshot create alex_wallet --network ic
dfx canister start alex_wallet --network ic

# bookmarks
dfx canister stop bookmarks --network ic
dfx canister snapshot create bookmarks --network ic
dfx canister start bookmarks --network ic

# emporium
dfx canister stop emporium --network ic
dfx canister snapshot create emporium --network ic
dfx canister start emporium --network ic

# ic_siws_provider
dfx canister stop ic_siws_provider --network ic
dfx canister snapshot create ic_siws_provider --network ic
dfx canister start ic_siws_provider --network ic

# ic_siwe_provider
dfx canister stop ic_siwe_provider --network ic
dfx canister snapshot create ic_siwe_provider --network ic
dfx canister start ic_siwe_provider --network ic

# icp_swap
dfx canister stop icp_swap --network ic
dfx canister snapshot create icp_swap --replace 00000000000000000000000001f053200101 --network ic
dfx canister start icp_swap --network ic

# icrc7
dfx canister stop icrc7 --network ic
dfx canister snapshot create icrc7 --network ic
dfx canister start icrc7 --network ic

# icrc7_scion
dfx canister stop icrc7_scion --network ic
dfx canister snapshot create icrc7_scion --network ic
dfx canister start icrc7_scion --network ic

# nft_manager
dfx canister stop nft_manager --network ic
dfx canister snapshot create nft_manager --replace 00000000000000010000000001f053220101 --network ic
dfx canister start nft_manager --network ic

# system_api
dfx canister stop system_api --network ic
dfx canister snapshot create system_api --network ic
dfx canister start system_api --network ic

# logs
dfx canister stop logs --network ic
dfx canister snapshot create logs --network ic
dfx canister start logs --network ic

# tokenomics
dfx canister stop tokenomics --network ic
dfx canister snapshot create tokenomics --replace 00000000000000010000000001f053240101 --network ic
dfx canister start tokenomics --network ic

# user
dfx canister stop user --network ic
dfx canister snapshot create user --replace 00000000000000000000000001f0531d0101 --network ic
dfx canister start user --network ic

# vetkd
dfx canister stop vetkd --network ic
dfx canister snapshot create vetkd --network ic
dfx canister start vetkd --network ic
