


I have done some analysis of the code,

following are the issues that I found, which are making our app slow


The component LibrarySearch has a useEffect hook.
Inside useEffect, on every transacation change it dispatches an action:
dispatch(loadContentForTransactions(transactions));

Function: loadContentForTransactions
This function returns a Promise and iterates over all transactions using .map().

Inside the mapping, two asynchronous calls are made:
const content = await ContentService.loadContent(transaction);
const urls = await ContentService.getContentUrls(transaction);

Function: ContentService.loadContent(transaction)

This function determines the type of content (image, video, etc.) and calls a corresponding function.
If it's an image, it calls:
const content = await ContentService.handleImageContent(url);

Function: handleImageContent(url: string): Promise
This function fetches content from the given URL.
fetch(url) and response.blob() converts the data into a binary format.
URL.createObjectURL(blob) generates a local URL for the fetched content.
The function returns an object containing the generated object URL.

Why are we using URL.createObjectURL(blob) instead of just url?
By this apporach we are loading content before even displaying to the user it is causing extra time to load.













































#### UI Fixes:
- Smaller homepage, no scrolling.
- Dropdown Menu from apps/swap.
- Hover animmation on apps.
- FAQ Page Consolidate.
- Visibility of the login button.



#### Features now:
- Figure out a better way than that prop passing to contentItem in contentList.tsx.
- Make a 'new' section for alexandrian that's the default, just showing the latest NFTs/SBTs.
- Finish the channels.md plan, given the new text rendering setup.


#### Bugs:
- Need more dynamic states for the like/mint/withdraw buttons.
- If the mint has succeded the mint button should go away.
- If you go to the next page on alexandrian while a modal is open it throws an error.
- On permasearch, when the safesearch model loads after the search is complete, it should run the check and make the assets mintable rather than requireing a second search attempt.

#### Bigger Features (lower priority):
- Dark Mode.
- Range selection for Alexandrian.
- Create a canister that indexes the SBTs, and an an associated count next to the NFTs, so we know how many likes each NFT has and display that next to them. Then sort by most liked.
- Put another amount selector by the show more button on permasearch.
- Need to combine emporium with main app modules (eventually, not now.).
- Authmenu.tsx open back up the dashboard and profile.
- Add the icrc3 canisters to the cycles manager.
- Index canisters.
- Autonomous NFT Backup Canister (automate the backup repo logic in a timer autonomous canister.)
- Likes tracker canister for NFTs. (and maybe secondary method for SBT.)

#### Permasearch Specific:

- Remove duplicates based on file size.
- More advanced searching with tags and metadata.
- Mint button has some load time issues on Alexandrian.
- Rank by tokens in the NFT.


#### New Apps:
- Arena style app, full design in channels.md.
- Collection service for getting all the money from nfts.




















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







