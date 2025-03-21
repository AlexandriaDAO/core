Before next mainnet push:
- Upgrade nft_manager.
- Upgrade user canister.
- Vetkd
- Wallet
- AssetManager


# Latest mainnet merge problems:
- Uploading the profile image or name does not reflect, i.e., I changed my name from chadthechad to evan and added a profile link and the result is still 'C' with a  loading circle.
- The Seed phrase import landed a super long result.


#### Bigger Features (lower priority):
- Loading is much faster without the nsfw check, and also permasearch page load is much longer when we make it by default. Instead we should allow people to search without NSFW checks, and let them check the individual nft that they want to mint. So we could do a no safe-search where no mints happen, a full safe search like we do now, and a mint-mode, where there's no default safe search but a check when someone goes to mint something.
- The upload payment is not enforced in the backend and a sophisticated user could bypass it by changing the redux state.
- Stop the autosearch on pageload alexandrian.
- Need more dynamic states for the like/mint/withdraw buttons. include in this singleTokenView.tsx which duplicates a lot of this logic. (If the mint has succeded the mint button should go away).
- Just more efficient loading, maybe lossless compression, or lower res on heavy assets. Maybe make this a setting for people based on how good their internet is.
- Cache the nsfw model so it doesn't have to be reloaded every time on permasearch.
- Find out why some NFT assets just arent able to render, and fix our rendering logic to fit them in.
- Rank by tokens in the NFT. (rating system for rarity.)

#### Permasearch Specific:

- Remove duplicates based on file size.
- More advanced searching with tags and metadata.


#### New Apps:
- Perpetua is a good name for one, latin for perpetual/eternal.





#### Alexandria-wide Next Goals: 
- Add the icrc3 canisters to the cycles manager.
- Get the profile/manager/library stuff opened back up and ready for production.
(1) Improve the Emporium app to be more like a real NFT marketplace. Keeping track of what has been sold, etc.
(2) Start work on a ICP --> AO bridge. I want to be able to bridge ALEX and LBRY to AO, so people can buy it on AO and send it to our site and use it without needing to buy ICP. This could also be a general bridge for other ICRC1 Tokens.
(3) Make an Autonomous NFT backup cansiter. If you look in the backups repo, we run a script to make a backup of all the NFTs. But there are too many to run this manually, so we need a canister to fetch the latest on a timer and keep updating the backups.
(4) An app or feature that lets checks all your NFTs for the amount of tokens in them, and orders them by amount so it's easy to withdraw rewards.
(5) Like tracker for NFTs: Create a canister that indexes the SBTs, and an an associated count next to the NFTs, so we know how many likes each NFT has and display that next to them. Then sort by most liked.
(6) Add a ledger canister for $ALEX and $LBRY.














XWKa-Q2gppignoX_Ngs7VJYZPN_yhiy1ToovQ1NBMFs
NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I 09/2022
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc
bqQgrxMXYFJXTqS5EF_XgmHUYyLNPXUv5Ze_c0RlW18 05/30/2024 (all oldschool paintings)
dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal 3j33x-5dvgt-y4x5x-7qkv2-hdldo-w6klv-23c2q-ljvpb-bouub-6nipv-rqe)





Key Issue: Content Loading Flow Inconsistency
The real problem appears to be in the updateTransactions thunk where there are two distinct paths:

1. Asset Canister Path:
   - Loads transactions from canister
   - Processes each transaction individually
   - Dispatches content loading
   - Has proper error handling
   - Works as expected

2. Direct Arweave Path:
   - Loads transactions via fetchTransactionsForAlexandrian
   - Only dispatches setTransactions
   - MISSING: Does not trigger content loading flow
   - MISSING: No error handling for individual transactions

What's NOT the Problem:
- Promise chains in asset canister flow (they work correctly)
- loadContentForTransactions implementation (it works when called)
- Redux state management (states are being updated correctly)
- Error handling in content loading (it's properly implemented)

Required Fix:
The direct Arweave path needs to:
1. Load transactions
2. Dispatch setTransactions
3. Trigger loadContentForTransactions
4. Maintain consistent error handling with the asset canister path









- The reason to LP in the chain-native token is primarily social. This is a clear bias, as something else will outperform that chain's native token.
