#### Bigger Features (lower priority):
- Need more dynamic states for the like/mint/withdraw buttons. include in this singleTokenView.tsx which duplicates a lot of this logic. (If the mint has succeded the mint button should go away).
- Just more efficient loading, maybe lossless compression, or lower res on heavy assets. Maybe make this a setting for people based on how good their internet is.
- Cache the nsfw model so it doesn't have to be reloaded every time on permasearch.
- Get rid of the topup concept, and make all lbry payments directly from the wallet, and display balance in the header.
- Find out why some NFT assets just arent able to render, and fix our rendering logic to fit them in.
- Rank by tokens in the NFT. (rating system for rarity.)

#### Permasearch Specific:

- Remove duplicates based on file size.
- More advanced searching with tags and metadata.


#### New Apps:
- Arena style app, full design in channels.md.
- Collection service for getting all the money from nfts.
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
dfx ledger transfer --icp 99 --memo 0 $(dfx ledger account-id --of-principal yvjik-zehkk-qo7nr-t4r7a-2aomx-mnp6e-htymf-r2adf-d7gjm-bpu3e-aae)





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
