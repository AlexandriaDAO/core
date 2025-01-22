
Feature Ideas:
- Create a canister that indexes the SBTs, and an an associated count next to the NFTs, so we know how many likes each NFT has and display that next to them. Then sort by most liked.
- Make a 'new' section for alexandrian that's the default, just showing the latest NFTs/SBTs.
- Figure out how we're going to sort by section.


Immported Libmodules.
1. In `AppModules/contentGrid/components/ContentValidator.tsx`:
and nsfwselector.tsx






- If the mint has succeded the mint button should go away.
- Need more dynamic states for the like/mint/withdraw buttons.
- If you go to the next page on alexandrian while a modal is open it throws an error.
- On permasearch, when the safesearch model loads after the search is complete, it should run the check and make the assets mintable rather than requireing a second search attempt.m




- Need to combine emporium with main app modules.
- Authmenue.tsx open back up the dashboard and profile.

The Plan:

- Alexandria query. (Query token amounts, then only the amount on the page (rather than all at once))



Next Small Stuff:

- Remove duplicates based on file size.
- More advanced searching with tags and metadata.
- Mint button has some load time issues on Alexandrian.
- Rank by tokens in the NFT.




Next Big Stuff:
- Add the icrc3 canisters to the cycles manager.
- Index canisters.

- Apps page leaderboard of top NFTs (perhaps from a backup system off-chain)
- Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.









### Adding channels/blocks/collections to sort NFTs.

Metrics: 
9.97T Cycles in ICP Swap at 830 am, and it's dispersing once per minute.
9.765T Cycles at 7am the next day. (But it could also be that it's because it stopped distributing.)
9.470 Several days later (12/16), right before deploying tests canister. (the tests canister itself has 8.81T cycles at noon before deployment)
12/19 (3 days later): icp_swap is at 9.025 and tests is at 7.411.


XWKa-Q2gppignoX_Ngs7VJYZPN_yhiy1ToovQ1NBMFs
NVkSolD-1AJcJ0BMfEASJjIuak3Y6CvDJZ4XOIUbU9g
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8 
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I  09/2022
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc







Topup Records:
- ALEX lost 10T cycles in the 15 hours after launch. I topped it up to 50T Cycles.
- LBRY lost 10T cycles in the 15 hours after launch. I topped it up to 50T Cycles.








CDN Plan:
- So allow the user to upload all their files to an asset canister.
- When we query by token id, we first query the asset canister. If it's not there move to the arweave gateway.
