!/bin/bash
dfx canister snapshot list alex_frontend --network ic

# # Load snapshot
# dfx canister stop alex_frontend --network ic
# dfx canister snapshot load alex_frontend 00000000000000110000000001f0531c0101 --network ic
# dfx canister start alex_frontend --network ic

set -x

dfx identity use mainnet


# alex_frontend
dfx canister stop alex_frontend --network ic
dfx canister snapshot create alex_frontend --replace 00000000000000100000000001f0531c0101 --network ic
dfx canister start alex_frontend --network ic

# alex_wallet (done)
dfx canister stop alex_wallet --network ic
dfx canister snapshot create alex_wallet --replace 00000000000000000000000001f0531e0101 --network ic
dfx canister start alex_wallet --network ic

# alex_backend
dfx canister stop alex_backend --network ic
dfx canister snapshot create alex_backend --replace 00000000000000000000000001f0531b0101 --network ic
dfx canister start alex_backend --network ic


# user (done)
dfx canister stop user --network ic
dfx canister snapshot create user --replace 00000000000000010000000001f0531d0101 --network ic
dfx canister start user --network ic

# vetkd (done)
dfx canister stop vetkd --network ic
dfx canister snapshot create vetkd --replace 00000000000000000000000001f053250101 --network ic
dfx canister start vetkd --network ic

# nft_manager (taken 05/26)
dfx canister stop nft_manager --network ic
dfx canister snapshot create nft_manager --replace 00000000000000040000000001f053220101 --network ic
dfx canister start nft_manager --network ic

# asset_manager
dfx canister stop asset_manager --network ic
dfx canister snapshot create asset_manager --network ic
dfx canister start asset_manager --network ic

# Emporium
dfx canister stop emporium --network ic
dfx canister snapshot create emporium --replace 00000000000000020000000001f07b4e0101 --network ic
dfx canister start emporium --network ic

# perpetua
dfx canister stop perpetua --network ic
dfx canister snapshot create perpetua --replace 00000000000000040000000001f0531f0101 --network ic
dfx canister start perpetua --network ic












