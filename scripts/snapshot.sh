!/bin/bash
# dfx canister snapshot list tokenomics --network ic

# # Load snapshot
# dfx canister stop alex_frontend --network ic
# dfx canister snapshot load alex_frontend 00000000000000080000000001f0531c0101 --network ic
# dfx canister start alex_frontend --network ic

set -x

dfx identity use mainnet


# alex_frontend
dfx canister stop alex_frontend --network ic
dfx canister snapshot create alex_frontend --replace 000000000000000b0000000001f0531c0101 --network ic
dfx canister start alex_frontend --network ic

# alex_wallet (done)
dfx canister stop alex_wallet --network ic
dfx canister snapshot create alex_wallet --replace 00000000000000000000000001f0531e0101 --network ic
dfx canister start alex_wallet --network ic

# user (done)
dfx canister stop user --network ic
dfx canister snapshot create user --replace 00000000000000010000000001f0531d0101 --network ic
dfx canister start user --network ic

# vetkd (done)
dfx canister stop vetkd --network ic
dfx canister snapshot create vetkd --replace 00000000000000000000000001f053250101 --network ic
dfx canister start vetkd --network ic

# nft_manager
dfx canister stop nft_manager --network ic
dfx canister snapshot create nft_manager --replace 00000000000000030000000001f053220101 --network ic
dfx canister start nft_manager --network ic

# asset_manager
dfx canister stop asset_manager --network ic
dfx canister snapshot create asset_manager --network ic
dfx canister start asset_manager --network ic

# Emporium
dfx canister stop emporium --network ic
dfx canister snapshot create emporium --replace 00000000000000000000000001f07b4e0101 --network ic
dfx canister start emporium --network ic









