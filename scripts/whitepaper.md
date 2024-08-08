# Alexandria WhitePaper

## Table of Contents
- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Part 1: Network Architecture](#part-1-network-architecture)
  - [Librarians](#librarians)
  - [LibModules](#libmodules)
- [Part 2: Token Economics and Mechanics](#part-2-token-economics-and-mechanics)
  - [LBRY Token](#lbry-token)
  - [ALEX Token](#alex-token)
    - [Minting Process](#minting-process)
    - [Distribution Mechanics](#distribution-mechanics)
    - [Utility](#utility)
- [Part 3: Non-Fungible Tokens Economics And Mechanics](#part-3-non-fungible-tokens-economics-and-mechanics)
  - [NFTs](#nfts)
    - [Ebook NFTs](#ebook-nfts)
    - [Other NFTs](#other-nfts)
  - [SBTs](#sbts)
  - [References](#references)
- [Part 4: Ecosystem](#part-4-ecosystem)
  - [Becoming a Librarian](#becoming-a-librarian)


## Introduction

The Internet has come to rely almost exclusively on Big Tech services as its information aggregators. This tweet summs up the effects from this that we all feel every day:

https://x.com/Noahpinion/status/1818776478315954200

The Static Web1 that was supposed to unlock the worlds information became buried by the Social Web2, sending 95-99% of digital content to the ‘deep web’ where it's inaccessible through conventional means. Today, digital content that isn’t (1) search-engine optimized, (2) open-access, and (3) brand new, is basically forever lost.

This paradigm stems from the Internets' ownership problem. Search engines don’t actually own what they point to, nor social platforms what they display, nor cloud providers what they host. Yet, their survival dpends on leveraging data as their own, blocking others from using it, optimizing for engagement over searchability, and disregarding the rights of creators. 
Web3 is an Internet where everything digital is owned by someone. This has been achieved for money, e.g., Bitcoin; and to some extent for art with NFTs, but nowhere else. It seems everyone has given up the purist vision.

To give true ownership to a peice of content, you basically need to keep the original fixed supply of one while being able to distribute it infinitely. Put simply, you need to recreate the search, social, and hosting elements around making use of that original copy—so that’s what we’re doing.

Alexandria is a library in cypherspace with all its information owned by individuals in the network, much like Bitcoin except for generic content instead of money. This begins with ebooks being owned and used as NFTs, but continues with any file type (video, audio, etc.), used in a suite of Open Internet Services.

Alexandria is not so much about building a 'new Internet', but going backwards with Web3-level tools to that time where Web1 became Web2. It's the place to opt-out for people who think we took the wrong fork in the road.

## Project Overview

Alexandria quite literally strives to be the world's largest public library. At its core, anyone can come in and put a book on the shelf (or movie, song, podcast, etc.) and anyone else can come pick it up.

As a Web3 library though, there are a few differences. Every book is guaranteed to last 'forever', and the upper limit on the number of books is infinity, so you'll likely not want to spend time in the main library, lest you never find what you're looking for.

Alexandria does provide template toolkits for advanced curation from the library's content through which people build apps.

Users interaction with Alexandria will often be through apps in the app store, much like library branches. Anyone can build their own branch, doing so with pre-existing tooling and content.

Authorship and creator rights are perfectly preserved since every peice of content in the library is owned. When a book is used with paid features, the payment is sent to and stored in the book itself and remains there until the rightful author/creator comes to claim it.

## Part 1: Network Architecture

Alexandria is the Web3 library we've been talking about. It indexes the entire library, gives you the tools needed to search it, and keeps track of whatever gets borrowed.

### Librarians

Alexandria runs on autonomous software so it's growth and expansion is powered by Librarians. 

After signing up with a preferred method, each user is given the option of saving their Principal in the Librarian Canister Registry. Once saved, that Librarian is able to store encrypted secrets, as well as the right for Alexandria Cansiters to decrypt them (VetKeys).

Stored API and wallet keys are usable in-app with ever exposing them to end users. These keys power in-app services called LibModules, which send revenue from paid features back to the Librarian providing the keys.

### LibModules

Alexandria, a self-contained place in cypherspace, is made navigable by porting open versions of the major 'Web Surfing' tools: Search, Social, Storage and AI.

Librarians carry the weight of this by hosting pre-configured deployments of open-source packages called 'LibModules'. Technically, they're just nodes that provide pluggable API for developers, starting with the following:

- ArWeave (completed): Uploads Alexandria-compatable books to the permaweb.
- Meilisearch (completed): Creates keyword search engines from the contents of books.
- AI (incomplete): Provides LLMs and other ML models, pluggable for use in partner apps.
- Qdrant (incomplete): Creates vector search engines from the contents of books.
- Bittorrent/IPFS/etc. (incomplete): Indexing existing movie/podcast/music files as part of the Alexandria Library.

(1) Storage-related LibModules use the node keys of Librarians to host on that given blockchain, e.g., Arweave/IPFS.

(2) Compute-related LibModules are simply API keys, agnostic to where the Librarian hosts.

In each case, the VetKeys secure access to LibModules. Functions can be called by sending dynamically priced nanopayments that pay Librarians.

Alexandria provides no storage or compute resources for LibModules, but only saves keys and performs compatability checks on them. LibModules are otherwise entirely managed and maintained by the ecosystem of Librarians.

The ideal Librarian is someone immersed in the convergence of technology and literature, but the typical one is just trying to make money from the token mechanism.

## Part 2: Token Economics and Mechanics

Alexandria is a dual token economy of two ICRC1 tokens: LBRY as energy and payment; and ALEX for revshare and governance.

LBRY is always mintable with ICP at a 1:1000 ratio, up to an infinite supply; and ALEX is mined when LBRY is burned, up to a hard cap of 21 Million, much like Bitcoin. 

### LBRY Token

LBRY's supply is entirely managed by the "icp_swap" canister. To mint LBRY, users send 1 ICP to the canister, and get 1,000 newly minted LBRY to their main wallet.

Users have two wallets by default: A 'main' and 'spending' wallet. Use of LibModules pays LBRY to the Librarian that hosts it. Using a paid NFT/SBT feature automatically sends that LBRY to that NFT/SBT wallet. After sending LBRY to the spending wallet, Alexandria can sign microtransactions on your behalf so payment happens in the background. 

Aftermarket LBRY can be spent again on other services or sold on secondary markets, but the key to retaining it's value is a burn mechanism that produces half of its inital purchase value, and mints the next block of ALEX.

### ALEX Token

ALEX mirrors Bitcoin tokenomics. It has an initial supply of zero and a total supply of 21 Million, and it's creation requires burning of LBRY (energy). There is no team, investor, or other hidden allocations.

#### Minting Process

A block is mined when someone sends 1 or more LBRY (whole numbers only) to the burn address. For each burned LBRY, 3 ALEX mints occur, and three parties are rewarded:

    (1) The sender who burned the LBRY is returned ICP at a 0.5:1000 ratio (1/2 the buy price), and one ALEX mint at the current minting rate.

    (2) A recently active Librarian is rewarded one ALEX mint at the current minting rate.

    (3) A recently active user is rewarded one ALEX mint at the current minting rate.

The selected user and Librarian are a the sending and recieving addresses of a randomly selected recent LBRY transaction (of the last ~100 transactions excluding those to the burn address). While this token swapping, burning, and minting logic is kept isolated and immutbable canisters, the method to select the random LBRY transaction is in the main backend cansiter and mutable, so it can adapt to only select for in-app payments and adapt to prevent gaming.

Spliting things this way keeps incentives balanced, i.e., each investment in the token is accompanied with two equal investment in some network contributors. Put another way, every time you use some paid app service, you're elible for an airdrop, and the allocation for airdrops is 100% of the token supply.

#### Distribution Mechanics

***We'll need to fix this equation for total supply =***

R_n = R_0 * (1/f)^n

Where:

R_n = minting rate at step n
R_0 = 5.00 x 10^2 (initial minting rate)
f   = 1.75 (rate drop factor)
n   = step number (starting from 0)

Constraints:

1. R_n >= 1.00 x 10^-4
2. Total ALEX supply <= 2.10 x 10^7
3. T_n = 2^n * T_0, where T_0 = 100
   (T_n is the LBRY threshold at step n)

![image](https://devnet.irys.xyz/nYIQwN_-EjFdmNCBSrfkD9E6-Sgixl8a0Zu3sj1gltQ)

- Token Economics and Utility (TOKENOMICS SECTION maybe)
  - It will take 50B actions for the supply to fully emit. Some words on decentralization

***End of unfinished part***

#### Utility

All the ICP used to mint LBRY is stored in the staking pool. 10% of the total ICP accrued in the staking pool is emmited to stakers proportionally every 24 hours.

Staked ALEX is also used for DAO voting via our governance mechanism, but voting is completely optional and carries no reward or penalty.

There's no utility other than voting. There's no value other than staking revshare.

## Part 3: Non-Fungible Tokens Economics And Mechanics

In Alexandria, everything you see is owned by someone in some way. This ownership is of three forms: 

(1) Non-Fungible Token (NFT) - Owned files that can be transfered.
(2) Soul-Bount Token (SBT) - Owned content fragments that cannot be transfered.
(3) Reference - A secondary copy of an SBT or NFT that cannot be transferred.

## NFTs

Alexandria NFTs aim to encompass all content types, starting with ebooks, and eventually, videos, songs, podcasts, etc.

Since Ebooks are generally attributable to a single person and of a managable file size, the ability to use and mint them is already finallized in-app.

The solution for more generic file types will likey use the same single "Alexandria NFT" collection, but have different metadata and hosting locations that are to be determined.

### Ebook NFTs

Alexandria NFTs use a Motoko implementation of the ICRC7 and ICRC37 standards, with default transfer, mint, burn, etc., functionality. There is no supply cap, and anyone can mint an NFT at an availible mint#, which starts at 1 and increases consecutively.

The minting uses the ArWeave LibModule, where Librarians host a pre-paid node that can upload files to the permaweb.

The cost to mint is an estimated 1 LBRY + 5LBRY/MB at a $10 ICP (1LBRY=1cent at $10 ICP). It costs Librarians $0.027/MB, so this is a breakeven price plus free ALEX mints for Librarians if they were to burn the LBRY, or a 2X margin at the LBRY purchase price.

Let's look at an example. You are a Librarian with some LBRY and seek to mint a 10MB version of "The Bible" as the first NFT on Alexandria. After clicking "Mint NFT" on the manager page, you select the ArWeave Node of the Librarian you wish to use, upload the book, and populate/check some manual/autogenerated fields:

    Files: [.epub file]
    Cover: [image uploaded by the minter]

    tx_id: nYIQwN_-EjFdmNCBSrfkD9E6-Sgixl8a0Zu3sj1gltQ
    Title: The Bible
    Author: God
    Content-Type: application/epub+zip
    application-id: Alexandria
    minting_number: 1
    fiction: false
    language: en
    author_first: I
    author_last: AM
    type: 2
    type0: 0
    type1: 0
    type2: 1
    type3: 0
    type4: 1
    type5: 0
    type6: 0
    type7: 1
    type8: 0
    type9: 0
    era: 1

If the human readable version in the UI checks out, you submit to pay 51 LBRY and mint. That LBRY is sent to the chosen Librarian, their node upserts all this data to ArWeave, and then our backend mints the ICRC7 NFT with the following fields:

    mint#: 1
    tx_id: nYIQwN_-EjFdmNCBSrfkD9E6-Sgixl8a0Zu3sj1gltQ
    owner: 2jgt7-v33z4-tiosh-csi2v-66cge-4uu7j-v2nye-z27vc-d36pc-ctqai-bqe
    collected_lbry: 0
    collected_alex: 0
    verified: false

The first set of fields is immutably stored on ArWeave. 

Of the second set of feilds, the mint# and tx_id are immutably stored on ICP and map to the ArWeave data, while owner, collected_lbry, and verified are mutably stored on ICP to give Alexandria NFTs certain special features.

Alexandria employs an "nft_manager" canister to handle mutable metadata. It has several functions:

    (1) Manage NFT Wallets.
    (2) Change an NFT's 'verified' field from false to true if requested by the DAO.
    (3) Transfer an unverified NFT to its rightful owner if requested by the DAO.

Let's continue with our example. After you minted "The Bible" as the first Alexandria NFT, others can now pay LBRY to use it in the various ways we'll soon see.

LBRY paid use of this NFT #1 is put in subaccount "000...1" of the nft_manager canister. Since it's recieving LBRY payments, it's also eligable to recieve ALEX mints to that same account. In order for you, the owner, to claim this money, you must first verify yourself as a rightful owner by sumbiting a proposal to the DAO. Assuming the version of "The Bible" is Open Domain, you're able to use it as your own and the DAO will likey approve it, which instructs the nft_manager canister to change the verified field to 'true', at which point you can claim all rewards and no-one can ever reverse that NFT ownership.

Assuming you uploaded the latest James Patterson novel and went through the same steps, this would fail, and you'd not be able to gain any profit from the book. Rather, all the profit accrued from it's use will be 'stuck' there until James Patterson comes on the site and submits a DAO proposal, at which point, the nft_manager canister will transfer it to him and verify it so all funds can be claimed, and the book can be removed (burned) if he likes.

### Other NFTs

Replicating this process for things like video and audio is more complicated because (1) file size is much bigger and would be quite expensive on ArWeave and (2) they often have many contributors and so how to split rewards has not been figured out.

Alexandria will start with ebooks, and then adapt the DAO and storage methods to accomodate more file types under the same collection.

### SBTs

Alexandria SBTs are much more versatilile since they do not require any standardized format. The upload is also 1LBRY + 5ICP/mb, and the only metadata is an ICP Principal. Examples that would be saved this way are a bookmarked snippets of an ebook, an in-site blog, a whiteboard made of other SBTs, etc.

All content on Alexandria Apps is an SBT. The purpose of this is simple: So you are paid when others use your work. If you'd like to save someone's SBT to your library, you'll pay the owner a small fee to make a reference.

### References

References are just saves of SBTs that allow you to use them as part of your own profile. In Alexandria you pay fractions of a penny in the background to bookmark, like and save the posts of others. These posts are saved in your own records and readily usable as a consequence.

It is the pinnacle of the sharing economy, akin to an Internet where the creator gets a kickback every time their content is liked or shared.

## Part 4: Ecosystem


### Becoming a Librarian

- Becoming a Librarian
  - First experience looks like an app store.
  - Apps will each have their own buisiness models and onboarding, but the apps we start with will be directly connected to the Librarian system.
  - COLLECT section (or part about authenticating librarians)

- Flagship App - Bibliotheca (library) - a kindle alternative.
  - Read - New users read whatever book they want.
  - Collect - Bullet part of this section about collecting stuff.
  - Earn - Kindof make from scratch.
  - Aggregate

- Partner App - Syllogos (aggregate)
  - AGGREGATE SECTION
  - SHARE SECTION
  - CREATE SECTION
  - Whiteboards.
  - Blogs.

Partner App - Dialectica (debate/reasoning):
- Uses SBTs + AI LibModule.
  - Debate Threads.
  - Sentiment analysis to discover truth.
  - etc. from scratch.

Partner App - Emporium (trading post): 
  - NFT marketplace for all Alexandria NFTs.
  - TRADE section.

Partner App - Dialogos (conversation)
  - Chatbots with people based on their collected works.

D-app ecosystem - Anything you can imagine.
  - The point is along the way we make these services that power apps, easily pluggable.
  - In this way the LibModule is built already for you, with a nice economic model that just works out of the box.
  - Of course people could fork this, and go do their own version, but in doing so they'll circumvent the economic model, loose network effects, and have to start from scratch in making their own building blocks.


## Part 5: Canister Architecture & Governance

- Governance (GOVERNANCE SECTION) SNS Deployment.
  - Initially it will just determine who owns what NFT.
  - The development will remain admittedly centralized, based on sheer complexity.
    - Things can go wrong, forks can occur, etc.
    - But the token stuff will be fair, blackholed, and rightfully forkable (decentralized).
  - SNS launch or fork are possibilies, but it's unclear what aditional canisters will be handed to the DAO, blackholed, or otherwise stay under centralized management.
    - The road to decentralization is paved with hypocracy. At least I'm being honest about it.


- Decentralization (we might not need this. Just enough to explain copyright stuff.)
  - This is a rudimentary DAO, and the only nessasary setup to decentralize now. The rest of the architecture, variable pricing, and code updates, are not configured to this DAO. 
  - The goal is to decentralize key elements with canister either by 'blackholing' and keeping Alexandria enforcably forkable at all times, or by canister control to the SNS or an SNS fork. At this stage though, it makes most sense to blackhole the token logic and leave the buisiness logic mutable because it will likely require years of itteration.
  - Explain why others can fork, or use their own version, and that's okay because they wouldn't want to.


## Internet of Books
conclusion.
(and perhaps the OG inspiration section with some modifications, or maybe not. I just personally like it. Maybe we scratch that whitepaper though, as the stuff isn't even that relevant anymore.)









### Structure

Since Alexandria best reflects a pan-industry platform of the Web’s core elements, it’s as a P2P network with infinitely scalable compute and storage. As such, it has many branching elements. Each section describes the architecture and user experience for each:

* Search Engine (Peruse)  
* E-Reader (Read)  
* Library (Collect)  
* RevShare (Earn)  
* NFT-Marketplace (Trade)  
* Search Manager (Aggregate)  
* AI/LLMs (Create)  
* Social Media (Share)  
* Publisher (Internet of Books)  
* DeFI Suite (Tokenomics)  
* DAO (Governance)

### Peruse

New users are greeted with a homepage, inclining them to interact with domain-specific search engines. Each contains a curated set of books with real-time full-text-search on their aggregate contents. Results are returned as book paragraphs that point to their origin at the source.

![image](https://github.com/user-attachments/assets/d98026f2-0f12-4263-b479-628c7d903371)

These search engines owned by other users we call *Librarians* (those who’ve registered their principal).  

![image](https://github.com/user-attachments/assets/13d6ee85-3f95-4d41-97a7-c4c040966c59)

### Read

A first interaction with Alexandria might feel akin to Google Search for Kindle—except all the search engines are owned by users and all the books are free.  

![image](https://github.com/user-attachments/assets/7ed355c9-4345-441c-a5e3-9f3a3287bc12)

All books used are owned as NFTs. Alexandria does not own or hold them. Rather, *Librarians* (NFT owners) ‘rent’ read access of their .epub file to our canisters, which is how we make them free to read.

![image](https://github.com/user-attachments/assets/1287d30a-295d-4d60-b584-9b2c6915519c)

Basic searching and reading is free, and does not require an account; but to save something on Alexandria is to ***own*** something, and so the remaining features do.

### Collect

Attempts to save data to the the library of an unregistered user will prompt them to register with one of the following auth solutions:

* Internet Identity (II)  
* Google Auth SSO  
* Ethereum Wallet  
* Solana Wallet  
* NFID

After signup, a principal is generated and stored making that user a *Librarian*.

Librarian’s have two in-app wallets by default:

(1) Saving wallet: Stores ICP, ICRC1 tokens, and ICRC7 NFTs much like a typical wallet. Using it is totally optional, but a nice way for users to keep track of Alexandria-related assets.  
(2) Spending wallet: Designed to store and spend LBRY without explicit signatures from the user for each transaction.

The setup is simple. Librarians can always swap ICP for LBRY at a 1:1000 ratio, or if they don’t have ICP, they can buy some with a credit card using our proxy service.

Once set up, librarians can start collecting items:

* Ebook NFTs (by buying or minting them).  
* Search Engines (by building them out of books).  
* Fragments SBTs (by finding and saving book snippets).  
* Iceberg SBTs (by creating content from fragments).

The more ambitious librarians can also provide the services others use collect items:

* NFT and SBT Minter (by providing an ArWeave node)  
* Search Engine Maker (by providing a Meilisearch and/or Qdrant host)  
* AI Generators (by providing LLM host).

This setup process unavoidably asks a lot of people, and being a librarian isn’t for everyone. They will work with multiple wallets, multiple search engines, and multiple fragment types just in their personal library. 

That’s why initial target market for Alexandria is self-custody enthusiasts. The kind of people who use Linux instead of Windows, a Bitcoin wallet instead of a bank, and locally stored books/movies/music instead of Kindle/Netflix/Spotify. 

Like each of these examples, Alexandria will take some getting used to, but eventually replaces complexity of needing multiple services. The seasoned Alexandria user does not need YouTube, Facebook, or Google; but will just port that content to the library where it’s more readily usable.

### Earn

\- The main motivator is money.

\- LBRY pays for:  
\- Search engine creation.  
\- Book NFT minting.  
\- Fragment SBT saving.  
\- Whiteboard/Iceberg Saves.  
\- AI usage.

Rates are variable. Everything on the site though, except for canisters which store a minimal amount of data, everything is hosted and paid for by users themselves.

What do users get that spend the library?

A system that tracks their outcomes in ALEX. As they get props, they get greater mints in ALEX.

Tokenomics will probably have to be next but I don’t want to deal with that.

Most Alexandria revenue comes from ICP used to mint LBRY. That revenue split is tentatively set at a 50/50 between (1) book owners and (2) ALEX Stakers minus canister cycles costs. This section concerns only ICP/LBRY flows, while the Tokenomics section alone explains ALEX distribution mechanics.

To use paid features in Alexandria, users first top-up with LBRY at a 1 ICP:1000 LBRY Ratio. This 1:1000 LBRY minting rate is fixed in an immutable canister with zero initial allocations. The cost (in LBRY) for different on-site interactions will remain variable for the foreseeable future to counteract ICP’s volatility.

Every paid interaction sends LBRY to a burn address, and credits the responsible book owner, e.g., when a user burns 1 LBRY to bookmark a *Moby Dick* snippet, the owner of the Moby Dick NFT is owed 0.0005 ICP by the Alexandria protocol (half of the cost to mint that LBRY). Librarians can mint and host as many book NFTs as they like, and claim their ICP rewards whenever they choose.

The remaining ICP goes to canister top-ups, and then to ALEX stakers. ALEX staking grants voting rights, but voting is optional and does not impact rewards. ALEX is not used elsewhere in the app and has no function other than ownership, and rev-share.

### Trade

All that fall into the Alexandria collection are of the ICRC-7 standard, and fully mutable by their author with ICRC-37 extensibility. All Ebook NFTs are mintable on-site for a small fee, and tradable in an on-site marketplace for a 5% royalty. All of this revenue goes to ALEX stakers.

NFT Mint Numbers, or UGBNs (Alexandria Book Numbers), are consecutive, so the first book minted has a UCBN of \#1, the second with \#2, and so on. Once these slots are taken, they can never be changed except by the owner; giving a certain novelty status to early minters.

Since NFTs are based on their ebook files, preventative measures are taken to prevent minting duplicate titles, but this still occurs with different book versions/editions. Still, the visibility, and thus value, of any Alexandria NFT, is weighted by the metadata it accrues from other’s use of it. In other words, readers only need one *Moby Dick*, and the site is designed such that once the first or most used one becomes the crowd favorite, it becomes unprofitable to continue hosting a duplicate.

All data attributed to each Book NFT is listed as follows:  

<NFT SPECS IMAGE (TBD)>

### Aggregate

With the ebook hosting handled with Drive, and file access handled by NFTs; aggregating that ebook data becomes simple.

In the Librarian’s portal, a user can add or remove books from their custom search engine with a single click. When ready, it can be published and public to others, or optionally remain private to the creator.  

![image](https://github.com/user-attachments/assets/7ba71795-bf65-4ebb-8ba8-6bb694418538)

*Librarians* pay for their search engine hosting in ICP via the portal, and receive no direct reward for making the search engine. The incentive for hosting a search engine is that it gives visibility to the books it holds, indirectly generating revenue for those book owners.

### Share

*Bookmarks* are customizable annotations that allow you to save any snippet from any book. What’s left are building blocks of knowledge that someone deemed valuable, and Alexandria simply adds the tools to make it easy to gear them toward answering a question people want the answer to.

*Bookmarks* are pseudonymously public, once saved, so anyone can read and use those snippets. So in addition to full-text search on books, users can search the database of existing bookmarks by book(s). Each subsequent *favorite* of that bookmark rewards ALEX the original owner.

### Create

Using bookmarks as a building block, users aggregate and arrange them in combinations for use with AI. An ever-growing suite of on-chain AI tools can be used to summarize, condense, and analyze the perspectives of different authors in relationship to the user’s question.

Such findings are designed to be saved and published to *Whiteboards*: A user-owned virtual space that can be either public or private, that aggregates *Boomarks* with AI outputs and reader notes.

*Whiteboards* are intended to be a Single Source of Truth in the most literal sense. Whether for personal exploration or as the research foundation for a virtual presentation, there is no more comprehensive way to present a case built upon primary sources.

### Internet of Books

Ebooks, like all websites, are HTML pages. We commonly use .epub files with text alone, since they emulate books, but they can just as easily contain images, audio, video, etc. The .epub format shines over .html in organization and information density since their maker must order pages in a linear thread around a coherent subject or idea.

From stone tablets to scrolls, to the codex; books have always been the universal means through which mankind preserves the written and spoken word. Webpages come and go, but for the ones that matter most, Alexandria hopes to be the publisher to bring the modern equivalent to a format of comparable permanence.

In an upcoming iteration, Alexandria will add a bookmaker LibModule, where by YouTube Channels, Podcast RSS feeds, Social Profiles, etc., can be autonomously transcribed and formatted into Ebook NFTs; keeping the same searchability as raw text and the same ease of viewing as their native content platform.

### Tokenomics

ALEX is the native token, and will mirror the distribution mechanism of Bitcoin:  

![image](https://github.com/user-attachments/assets/ba822105-c8f1-4ea4-af7b-61c0f18cba1b)

Instead of block mining though, ALEX emits based on *favorites*. As a user spends/burns LBRY to save bookmarks, their *favorite* action becomes value-bearing. Users can favorite their own bookmarks, or the bookmarks of others, with caps and mechanisms to prevent bots.

ALEX can be added to the staking pool to passively earn a share of Alexandria revenue. Staked ALEX also grants optional voting rights, but participation does not impact rewards. ALEX does not have any other utility or function.

### Governance

UncensensoredGreats is currently a centrally developed and deployed project. It depends on an architecture of tentatively ‘blackholed’ canisters, so the renounching storage and token related smart contract over time. It is fully open-source, so the current state of decentralizion can be tracked on [Github](https://github.com/UncensoredGreats/).

The frontend will be continuously developed, and so use of backend functions from blackholed canisters will remain mutable indefinitely. Nonetheless, anyone can fork the project with an alternative frontend that’s bound by the same code and data of Alexandria’ universal backend canisters.

Since this model prioritizes immutability for the sake of permanence, governance is limited to matters involving NFT ownership. The governance mechanism allow proposals that can delete NFTs (if corrupted/inaccurate), or transfer the ownership (to any true author that claim it) with a simple majority and quorum of staked ALEX holders.







