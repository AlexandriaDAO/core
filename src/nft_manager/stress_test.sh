#!/bin/bash

# Number of NFTs to mint
num_nfts=100

# Loop to mint NFTs
for ((i=0; i<=num_nfts; i++))
do
    result=$(dfx canister call nft_manager mint_nft "(\"NFT #$i\", $i)")
    echo "Minted NFT #$i: $result"
    
    # Optional: Add a small delay to avoid overwhelming the system
    sleep 0.1
done

echo "Minting complete. Total NFTs minted: $num_nfts"