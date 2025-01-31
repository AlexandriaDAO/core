Benefits to the IC ecosystem:

The largest benefit in my estimation is the untapped user acquisition potential for ICP of our target audience. Our efforts are dedicated toward attracting people that hang out on Internet Archive, Goodreads, and Project Gutenberg. Each of these sites have millions of unique visitors per month with no exposure or interest in the typical goings on of crypto/web3. If I complete these grant milestones, this will be the ultimate manifestation of this audience's dream project. Their very first interaction a blockchain will revolve around books, art, historical documents, etc., and their second interaction with a blockchain will be on ICPSwap or KongSwap. The value of such an onboarding interaction is simply immense given that it opens the floodgates to literally billions of high value users that would never otherwise hear about ICP/Web3.

That said, there are plenty of more concrete components of our tech stack of immediate value to the IC ecosystem.

(1) Forkable Tokenomics:

Alexandria launched with a novel tokenomics model whereby token minting is a consequence of investment, and investment is returned entirely to stakers. You might think of it like an infinite LBP mixed with Bitcoin's mining system.

This entire mechanism is in two self-contained, open-source, and replicable canisters. My grant obligations will get this audited by SolidState and forked in a separate repo with a detailed guide for anyone who wants to replicate it in their own token launch.

Everyone who tried it and gets it went nuts over it, and I have no doubt this will be used to bring excitement to many project launches in the IC Ecosystem. It has already facilitated hundreds of thousands (possibly millions now) of transactions and 8 halving events without hiccups and all free to the user (about $15 estimated cycles cost).

It is entirely impossible to replicate on any other blockchain today, which could make a shining example of how even DeFI on the IC is realizing unimaginable feats.

(2) VetKey Sharing Scheme:

There are many cool application for VetKeys, but the one I'm using I have not seen suggested elsewhere.

It's already working in a beta form for admin wallet keys, but this grant will expand that use case to generic API keys and with the security that opens this feature to all users; including p2p crypto-payment for use of another's API or walletkeys.

Building this from scratch has been a non-trivial task, especially given the lack of examples of successful VetKey implementations. Part of this grant is a dedicated repo and guide that will get any builder 80% of the way to a dedicated P2P api or wallet sharing service.

(3) ICRC7 NFT Autonomous Backup Repo:

This is a canister and separate repository for that continuously backs up any ICRC7 NFT Collection that anyone can use out of the box.














Milestone 1:

- Optional Migration of NFTs from Arweave to ICP hosting.
  - Right now, primary NFTs are hosted on Arweave so they have guaranteed permanence. The problem is load times which can be as much as 2 seconds.
  - This feature is a one click option where user profiles can create and host their own Asset Canister and upload all their NFTs to it. This should reduce asset load times from 1-3 seconds to 200-300ms.
  - All lbry.app systems adjust to this query method: First check if the NFT is hosted on ICP and then render, if not render from Arweave.

- Pre-mainnet VetKey ETH Wallet Sharing:
  - Users can get selective access to ETH Private Keys pay ETH transactions that fund IRYS NFT uploads.
  - Payment will be in LBRY, proportioned to file size, the user never touches ETH.
  - ETH Private Keys that are uploaded are done so on lbry.app in a fully-fledged manner, but restricted to admin profiles (and wallets with small amounts of ETH until VetKey feature goes live).

- Audited, Separated Tokenomics Repo with detailed forking guide.
  - A forked repo with only our tokenomics and icp_swap canister, modified slightly for a general token/memecoin launch.
  - A basic frontend that and build script that gets the token live and mintable.
  - Prediction modeling and instructions for what parameters to change to customize a token launch.

- Like count on every Original NFT.
  - Separate canister, acting on a timer that retroactively collects all newly created Soul-Bound Tokens, converts them to their original NFT, and creates a separate mapping of likes for those original NFTs.
  - Module adjustments such that all apps that display NFTs include the like count.


Milestone 2:

- Flagship Library App (with Shelves and Items)
  - Backend: Users pays LBRY to create a "shelf", which is a title, description, etc; and a list of NFTs, SBTs, and other shelves. Users can freely mutate the contents and ordering of their shelves.
  - Frontend: A fully featured app that displays shelves and allows users to add/remove items in a drag and drop grid, as well as mutate the metadata of the shelf itself.
  - Special Feature: Everyone can view everyone's shelves and items, but they can only add to their shelf what they own, i.e., they must pay LBRY to like and NFT so they can add it to their shelf.
  - Result: An general content app with peoples favorite collections of jpg, epub, mp4, md, txt, html, etc.; making any file type feel like a universal, linkable, soverign, social media 'post'.

- AI Generated text & Image NFTs with VetKehy API sharing (not onchain AI)
  - VetKey sharing for select general purpose APIs (e.g., claude, midjourney, qdrant). Stipulation: (if the VetKey feature is not live on ICP Mainnet than this feature will be limited to admin profiles as the only key sharers).
  - Text driven AI able to generate .md/.txt NFTs, in a seamless UX that's paid for in background LBRY nanopayments (user does not neet to sign pay fractions of a penny for an api request).
  - Image driven AI able to generate .jpg NFTs ...

- Feature/App for NFT fund collection.
  - Takes custody of all the users NFTs and the LBRY and ALEX balances inside each NFT.
  - Rank orders them by token ammount and allows the user to collect all their tokens at once.

- Autonomous NFT Backup Canister.
  - Right now our ICRC7 implementations are not audited and are backed up manually [here](https://github.com/AlexandriaDAO/backups), but the size has become unmanageable.
  - This milestone will see an autonomous canister that backs up our icrc7 and icrc7_scion canisters on a timer, producing a regularly updated 1-click redeploy file should it ever be needed.
  - Published as a separate repo that's perfectly applicable to the pan-industrial icrc7 implemenation, and loosely applicable to any other icrc7 implementation, i.e., it still can be used to collect necessary data for any collection, but the deployment files will have to be tailored to the specific implementation.


Milestone 3:

- Search Engine Ereader App (formerly syllogos)
  - Custom search engines: Users can create search engines that automatically ingest NFTs lbry.app NFTs including books, and yield full text search across all that text content.
  - Book Snippet & Search Result NFT Minting. While inside a pdf or markdown file, sections of it can be copy and pasted into a user's own NFT with ease. While inside an  book, user can save a bookmarked snippet of the text as an NFT that is linked to it's precise location, e.g., someone who views this NFT will be taken to the exact paragraph inside the ebook.
  - Since all this content is permanent at it's original location, the NFTs derived from another will always be linked to its original source.

- 3rd Party Wallet Support 
  - Auth support for NFID and ETH/SOL/AR (at least 1 major wallet from each chain).
  - Experience will remain ICP-native for other wallet auth methods, but with the intention of combining with our fiat onramp and/or proxy contracts that support other cryptoassets.

- Blackholed Tokenomics Canisters:
  - The tokenomics canisters are currently have multiple controllers. the following canisters must be blackholed, thereby making the tokenomics of Alexandria permanent under the existing ruleset: ALEX, LBRY, icp_swap, and tokenomics.

Milestone 4:

- Fiat onramp OR Proxy Contract for LBRY purchase with non-ICP option.
  - ***This is an either/or proposition. While both would be nice, I don't know how possible/practical it is to do both.***
  - If a fiat onramp, any new user regardless of authentication option will be able to purchase LBRY with a credit cards and be on their way.
  - If a proxy contract, users will be able to buy LBRY by sending ETH, SOL, or AO to a proxy contract. Note: At least 1 of these chains/assets is the deliverable, not all 3.

- Separate VetKey Implementation Repo:
  - Detailed guide for using our VetKey solution for p2p key sharing.
  - Basic frontend for authenticated users to add wallet and api keys.
  - Included in the frontend is example usage of a VetKey enabled wallet signature and API request initiated by a second user.

- $ALEX Bridged and Liquid Trading on at least 1 other blockchain.
  - This is self explanatory. We need to reach other communities to make ICP onboarding easier, and increase the pool of availible liquidity.
  - If no existing solution exists by this time, then I'll need to make the bridge itself, and seed it, whereby ALEX is locked on ICP and minted on some other chain according to their standard, and vice versa.

- Onchain AI:
  - NFT generation from an AI Model hosted entirely inside ICP canisters.
  - Guaranteed text generation LLM experience inside the Alexandria ecosystem, paid for in the background with LBRY nanopayments.