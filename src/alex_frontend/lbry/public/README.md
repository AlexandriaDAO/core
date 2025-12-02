# Alexandria WhitePaper

> *"There are lots of entrepreneurs and investors that want to build interesting new services. The problem is, often times those interesting new internet services would depend upon content, functionality, and user data that exists inside of proprietary services, owned and controlled by Big Tech."*
> 
>
> — Dominic Williams, DFINITY founder on ["The Internet Computer Vision"](https://youtu.be/DYVPq_vMB8w?si=w_jopM2o22UQjqwH)

**tldr: Alexandria is the dapp store to port Web2's content, functionality, and user data to a Web3 Stack. Our goal is to become the definitive content destination for discerning users.**

*This is not a conventional whitepaper in that it's an evolving document, though it's entire history is availible on our github.*

## Table of Contents
- [Alexandria WhitePaper](#alexandria-whitepaper)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Part 1: Network Overview](#part-1-network-overview)
    - [Modules](#modules)
      - [VetKey Modules](#vetkey-modules)
      - [LibModules](#libmodules)
    - [AppModules](#appmodules)
  - [Part 2: Token Economics and Mechanics](#part-2-token-economics-and-mechanics)
    - [LBRY Token](#lbry-token)
    - [ALEX Token](#alex-token)
      - [Minting Process](#minting-process)
      - [Distribution Mechanics](#distribution-mechanics)
      - [Long-Term Incentive Balancing.](#long-term-incentive-balancing)
      - [Utility](#utility)
  - [Part 3: NFT Economics And Mechanics](#part-3-nft-economics-and-mechanics)
    - [Content Types](#content-types)
      - [NFTs](#nfts)
      - [SBTs](#sbts)
      - [App \<\> Content Interaction](#app--content-interaction)
  - [Part 4: Ecosystem](#part-4-ecosystem)
    - [Alexandrian (flagship app)](#alexandrian-flagship-app)
    - [Permasearch (explore)](#permasearch-explore)
    - [Bibliotheca (library)](#bibliotheca-library)
    - [Syllogos (aggregate)](#syllogos-aggregate)
    - [Perpetua (write)](#perpetua-write)
    - [Dialectica (debate)](#dialectica-debate)
    - [Emporium (trade)](#emporium-trade)
    - [Taking on Big Tech](#taking-on-big-tech)
  - [Part 5: Architecture \& Governance](#part-5-architecture--governance)
    - [Governance](#governance)
    - [Inspiration](#inspiration)
      - [The Hyperlink Paradigm](#the-hyperlink-paradigm)


## Introduction

The Internet has come to rely almost exclusively on Big Tech services as its information aggregators. This tweet sums up the daily effects we feel from this:

https://x.com/Noahpinion/status/1818776478315954200

The Static Web1 that was supposed to unlock the worlds information became buried by the Social Web2, sending 95-99% of digital content to the 'deep web' where it's inaccessible through conventional means, and force feeding the rest of it to us with black-box algorithms on proprietary platforms. Today, digital content that isn't (1) search-engine optimized, (2) open-access, ***and*** (3) brand new, is basically lost forever.

This problem is unsolvable on Web2. Hyperlinks can change, move or disappear at any time; and there's no consensus on who owns any given peice of content.

There's a better way. Alexandria is a protocol layer and app suite where the all data is permanent, owned by someone, with innate rules on how others can use them. Building this way will allows a fair economy to emerge and hopefully restore that sense of awe and human connection to farmilliar to the early internet.

## Part 1: Network Overview

Alexandria has only 2 protocol level dependencies (excluding TCP/IP): ArWeave (for content) and ICP (for services) - essentially, the 'AI Stack'. This foundation enables several innovative features that appear to be first of their kind:

  - VetKey Sharing - Users can 'borrow' eachother's Private Keys or API Keys without revealing them to anyone; allowing the community to bridge any Web2 service to their apps.
  - NFT Wallets - Everything on-site is an NFT, and it's own entity that must be paid when used, allowing the rightful owner to collect any revenue made from their assets.
  - Usage-based Fair-Launch - 21 Million tokens carefully emitted during an up to 60 billion platform actions that make whale and bot games economically unfavorable.

Interaction with Alexandria will often be through apps composed of 'free software.' Eventually, anyone will be able to fork and modify these apps (or all of Alexandria) while staying pluggable with these pre-existing toolkits and content.

### Modules

Alexandria has three types of module: VetKey Modules, LibModules and AppModules, availible through APIs or in the core frontend for app developers. The intent is to seed community-created Apps that reimagine the major search, social, and ecommerce platforms. Modules are how we minimize the amount of complex logic in each app so the heavy lifting is already done by the protocol for andy new service.

#### VetKey Modules

Librarians can store, share, and borrow private keys of any kind. These can be private wallet keys or API keys that access external Web2 services and compute resources, e.g.:

- ArWeave Nodes (completed): Uploads Alexandria-compatable books to the permaweb.
- Meilisearch (completed): Creates keyword search engines from the contents of books.
- AI (incomplete): Provides LLMs and other ML models, pluggable for use in partner apps.
- Qdrant (incomplete): Creates vector search engines from the contents of books.
- Whatever else we might be needed for new apps.

The point here is that these aren't dev dependencies. They're peer-to-peer, so users can pay eachother to use Claude or sign an ETH transaction on another's behalf without ever revealing the keys required to do so. The regulator of these interactactions (and the only thing that sees the secrets) is core smart contracts.

#### LibModules

Alexandria provides the re-usable code bundles to interact with our smart contracts. LibModules make the logic-centric interface to our smart contracts. These make LibModules accessible to partner apps' UI building blocks. Our system for NFTs display attributes (render, like, withdraw, share) are part of a single import that abstracts away the frontend challenge of using NFTs.

### AppModules

These are primarily UI components with preloaded with common functionality, e.g., an NFT/SBT search engine with all our filters and sorting techniques. Any developers can layer these toolkits with custom parameters to create their desired features.

## Part 2: Token Economics and Mechanics

Alexandria is a dual token economy of two ICRC1 tokens: LBRY as energy and payment; and ALEX for revshare and governance.

LBRY is always mintable with ICP at a fixed price of $0.01 and has no fixed supply.

ALEX is mined when LBRY is burned, up to a hard cap of 21 Million. 

### LBRY Token

LBRY's supply is entirely managed by the "icp_swap" canister which uses the Exchange Rate Canister to keep the mint rate fixed at one cent per LBRY (unless ICP goes below $4 at which point it will stay at that fixed rate). Anyone can mint by sending ICP to the canister, which also serves as the staking contract.

All view-only features are free, but once a user has some LBRY, they can use any LibModules by paying Librarian that hosts it. When storing or otherwise interact with other NFTs, LBRY automatically sends nanopayments to those NFTs as payment.

Aftermarket LBRY can be spent again on other services or sold on secondary markets, but the key to retaining it's value is a burn mechanism that produces half of its inital purchase value in ICP, and mints the next block of ALEX.

### ALEX Token

ALEX mirrors Bitcoin tokenomics, but flattened by several orders of magnitude. It has an initial supply of zero and a total supply of 21 Million. Its creation is exclusively through the burning of LBRY (energy). There is no team, investor, or other hidden allocations.

#### Minting Process

A block is mined when someone sends 1 or more LBRY to the burn address. For each burned LBRY, 3 ALEX mints occur, and three parties are rewarded:

    (1) The sender who burned the LBRY is returned hald a cent worth of ICP (1/2 the buy price), and one ALEX mint at the current minting rate.

    (2) A random scion NFT of the last 1000 minted is rewarded one ALEX mint at the current minting rate (these are minted by liking someone else's existing NFT).

    (3) The original NFT of the selected scion NFT is rewarded one ALEX mint at the current minting rate.

The 'winning' accounts are the NFTs themselves. The owners later claim those tokens, or sell the NFTs with the tokens in them.

Spliting things this way keeps incentives balanced, i.e., each investment in the token is accompanied with two equal investments in some network contributors. Put another way, every time you mint an NFT, you're elible for an airdrop, and the allocation for airdrops is 2/3rds of the total supply.

#### Distribution Mechanics

Bitcoin launched with a 50 BTC Block Reward that halves every 210,000 blocks. Alexandria uses a similar but flattened modification of that minting schedule: A 5 ALEX initial block reward, and the halving rate at 21,000 that consecutively doubles.

BTC blocks are mined at mostly fixed intervals, while ALEX mints increase proportional to network use. The minting mechanism accounts for this by doubling the number of mints for a reward drop after each halving.

The result is a much flatter distirbution that takes ~62 Billion burned LBRY to emit.

| LBRY Burned      | ALEX Reward | Total ALEX Minted | Fully Diluted Valuation (XDR) |
|------------------|-------------|-------------------|-------------------------------|
| 21,000.00        | 5.0000      | 315,000.00        | $21,000.00                    |
| 42,000.00        | 2.5000      | 472,500.00        | $42,000.00                    |
| 84,000.00        | 1.2500      | 630,000.00        | $84,000.00                    |
| 168,000.00       | 0.6250      | 787,500.00        | $168,000.00                   |
| 336,000.00       | 0.3125      | 945,000.00        | $336,000.00                   |
| 672,000.00       | 0.1562      | 1,102,500.00      | $672,000.00                   |
| 1,344,000.00     | 0.0781      | 1,260,000.00      | $1,344,000.00                 |
| 2,688,000.00     | 0.0391      | 1,417,500.00      | $2,688,000.00                 |
| 5,376,000.00     | 0.0195      | 1,575,000.00      | $5,376,000.00                 |
| 10,752,000.00    | 0.0098      | 1,732,500.00      | $10,752,000.00                |
| 21,504,000.00    | 0.0049      | 1,890,000.00      | $21,504,000.00                |
| 43,008,000.00    | 0.0024      | 2,047,500.00      | $43,008,000.00                |
| 86,016,000.00    | 0.0012      | 2,205,000.00      | $86,016,000.00                |
| 172,032,000.00   | 0.0006      | 2,362,500.00      | $172,032,000.00               |
| 344,064,000.00   | 0.0003      | 2,520,000.00      | $344,064,000.00               |
| 688,128,000.00   | 0.0002      | 2,677,500.00      | $688,128,000.00               |
| 1,376,256,000.00 | 0.0001      | 2,883,938.40      | $1,000,000,000.00             |
| ...              | ...         | ...               | $1,000,000,000.00             |
| 61,763,128,000.00| 0.0001      | 21,000,000.00     | $1,000,000,000.00             |

These numbers were chosen with respect to (1) the BTC mechanism and (2) the anticipated Fully Diluted Valuation at any given point.

FDV is calculated as  21 million / (0.5cents * minting_reward):

For example, for each LBRY you burn during the first reward epoch, you'll loose the 1 cent it's worth but get back 1/2 a cent in ICP, and get one of the three corresponding 5 ALEX mints, i.e., a tenth of a penny per ALEX, which is a $21,000 FDV. Calls to mint are always capped at 50 ALEX, so during the first epoch, you can only burn 10 LBRY at a time, then 20 in the next, and so on.

![image](https://github.com/user-attachments/assets/dc66a866-01f6-4076-b1db-9124fd9f54a3)

From mints 0 to 1 Billion, the FDV is below $1B, but mints ~1 to 62 Billion are all made at the that $1B valuation. This means only ~15% of the supply is up for grabs at <$1B FDV, and 85% thereafter, ensuring there's guaranteed and substantial ownership available to Librarians at least up until Alexandria reaches 'Unicorn' status.

#### Long-Term Incentive Balancing.

A fair launch is pivotal to Alexandria's tokenomics, and incentives must be balanced in the early minting epochs as well as long after ALEX is fully minted.

The challenge in keeping the early epochs balanced is preventing bots. Preventative measures are discussed in the [launch details post](https://nuance.xyz/evan/12057-434go-diaaa-aaaaf-qakwq-cai/everything-about-the-alexandria-alex-fair-launch), which outlines a zero-tolerance policy for bots and our retaliation strategy during early epochs. The initial NFT minting price of 10 LBRY (significantly higher than the eventual 1 LBRY target) will be periodically adjusted to match ALEX minting rates, making bot-based random NFT minting economically unfeasible.

For incentives after all 21 Million ALEX are minted, LBRY remains a revenue driver for ALEX stakers. LBRY has a 0.04 universal transaction fee that is burned, and still returns half it's value in ICP if burned. As long as LBRY is being transacted (i.e.,the site is being used), LBRY is being burned, and revenue generated for stakers long after ALEX is fully minted.

#### Utility

All the ICP used to mint LBRY is stored in the staking pool. 1% of the total ICP accrued in the staking pool is emitted to stakers proportionally every hour.

Staked ALEX also represents a non-dilutive share in voting for any future DAO.

There's no utility other than voting. There's no value other than staking revshare.

## Part 3: NFT Economics And Mechanics

In Alexandria, everything you see is owned by someone in some way. This ownership is of three forms: 

(1) OG NFTS - Owned arweave files that can be transferred.
(2) Scion NFTs (Soul-Bound Tokens, SBTs) - Owned copies of the original that cannot be transferred.
(3) Boards (To be determined) - Collections of NFTs and SBTs grouped by topic or other user-defined criteria.

### Content Types

All Alexandria content is tokenized ArWeave transactions, and ICP-native references that index them. These could be any data type/format: a book, a movie, a song, etc., all fall in the same collection.

OG NFTs' Mint# encodes a ArWeave Transaction Id. Scion NFTs (SBTs) mint# combines with the owner principal to encode the OG NFT minting number. Both allow for an optional and mutable description in metadata, but the mint# and the location of its underlying asset are immutable, and so anything on Alexandria is essentially guaranteed to share the lifespan of the Internet.

#### NFTs

Alexandria NFTs use a Motoko implementation of the ICRC7 and ICRC37 standards, with default transfer, mint, burn, etc., functionality. There is a practically infinite supply cap (10^32 -1).

The minting uses the ArWeave LibModule, where Librarians host a pre-paid node that can upload files to the permaweb.

The cost to mint an NFT of an asset already stored on ArWeave is 10 LBRY for OG NFTs (burned) and 10 LBRY for Scion NFTs (10 burned, 10 to the OG NFT).

The cost upload an asset to ArWeave is variable, and seeks to match 1.5X the going rate for ArWeave uploads so as to reward Librarians with a 50% margin in LBRY, but this is subject to change.

Alexandria employs an "nft_manager" canister to manage all state changes to the NFT collection.

    (1) Manage NFT Wallets.
    (2) Update NFT Metadata.
    (3) Burn NSFW NFTs if requested by a community vote.
    (4) Transfer an unverified NFT to its rightful owner if requested by a community vote.

Currently, the "nft_manager" only serves the first two functions, allowing NFT owners to change and claim collected funds of their NFTs. DAO goverance to manage bad behavior is not implemented yet.

#### SBTs

A content's value tends to be in relationship to the content around it, that is, where it came from, who is interested in it, and how it is found. That's what SBTs are for.

Much like a 'like' on facebook or a 'retweet' on twitter, 

SBTs are a useful reference to some content, akin to 'like' and 'retweet' on social media with affixed rewards potential to the involved creator and aggregator.

NFTs can be collected and arranged in arbitrary ways that can be iterated on in each Alexandria App.

#### App <> Content Interaction

Apps can either query content directly from ArWeave or curate from our NFT and SBT primitives. When using the latter approach, the displayed content remains inseparable from its owners and built-in economics, ensuring the social graph stays intact regardless of implementation.

## Part 4: Ecosystem

Alexandria apps are services already plugged into LibModules. Since LibModule functions can only be accessed through AppModules that hold these LBRY payment mechanisms, all partner apps are also aligned with our universal DeFi mechanism.

As a Librarian, the lbry.app homepage will feel more like an app store than a Web3 tech stack. The following is a list of core apps in the works.

### Alexandrian (flagship app)

An exploratory social app where users explore and collect eachothers NFTs and arrange them in collaborative boards based on certain topics.

It's a test case in using AppModules that reflect our incentive mechanism. You'll earn for minting NFT that others collect, or collecting NFTs on a profile that others borrow from. Here you could also collect any funds inside your NFTs. Put simply, a game theory experiment for where good taste is the desired commodity.

### Permasearch (explore)

A asset based block explorer for ArWeave where you can search for any content by its metadata and save it as an Alexandria NFT.

### Bibliotheca (library)

A simple kindle clone where everyone can read any books they like for free.

![image](https://github.com/user-attachments/assets/7ed355c9-4345-441c-a5e3-9f3a3287bc12)

Special features:
  - Save fragments (text snippets) as SBTs.
  - Download books for a fee.
  - Full text search on any book while reading.
  - Cataloging of books you've read, are currently reading, and wish to read.
  - Share reviews, book fragments, and comments with other readers.

It's GoodReads meets Kindle with an economy inside.

![image](https://github.com/user-attachments/assets/1287d30a-295d-4d60-b584-9b2c6915519c)

### Syllogos (aggregate)

A app of custom search engines. Search through thousands of books with AI or keywords. If there's not one that fits your needs, make your own by clicking books you'd like to add to a new search engine. Save any results you might want to use later as SBTs.

![image](https://github.com/user-attachments/assets/d98026f2-0f12-4263-b479-628c7d903371)

These search engines are a modular and sometimes paid feature. Make a popular search engine, get paid for it as it gets integrated and used across other Alexandria apps.

It's Google, but the search engines are customized and actually designed to find information.

### Perpetua (write)

A blog-based app based around SBTs. All the text fragments you and others have collected here are used to create blogs and whiteboards that are attached to their primary sources.

In addition to conventional blogs, Syllogos replicates the viral Iceberg format where a topic is broken into interactive layers of increasing obscurity. Instead of a blog of text, this is a chart decorated with topic fragments, each linking to a primary source in a book that expresses a point about some topic.

Syllogos will employ various AI related LibModules to 'decorate' SBTs with titles, summaries, emojis indicating sentiment, badges indicating authenticity, and ratings from user feedback.

It's a place where golden nuggets are lifted from a sea of endless pages and brought to life, as if a trading card or other in-game collectable. It's Medium meets IcebergCharts.org, except hyperlinks to external sites are replaced with app-native components.

### Dialectica (debate)

A character-based AI app where users can train an AI on a set of NFTs and SBTs so they can speak on behalf of that author or topic by referencing the primary sources of their training data.

AIs of different specializations can debate eachother with users steering the conversations and ultimately evolving to consensus on which one is correct.

### Emporium (trade)

An NFT marketplace for all Alexandria NFTs.

NFTs are valued on a few displayed attributes. First is the mint#, early ones having a certain novelty, but there's also the accrued LBRY and ALEX over its lifetime and whether or not the NFT is verified. Since NFTs are money making assets, and also have money saved inside them, trades are about more than aquiring collectables.

Emporium will employ a 5% trading royalty, all of which goes to the staking pool.

### Taking on Big Tech

The preceding are simple app ideas with that are in progress today.

As the library comes to include movies, songs, podcasts, and videos at potentially infinite scale and with better indexing, anyone will be able to make the decentralized Netflix, Spotify, YouTube, etc., with Alexandria's existing content base.

The reason such apps are untouchable right now is because they're powered by data monopolies, but if we move all that data to a shared permaweb, than everyday devs are elevated to the same playing field as Big Tech.

## Part 5: Architecture & Governance

Alexandria will remained centrally managed during the testnet phase. All code is unaudited and impractical to manage through the SNS at this stage. The current strategy is gradually delegating tasks to DAO canisters and preparing others to be blackholed, but this will occur mainly after the testing phase.

### Governance

UncensensoredGreats is currently a centrally developed and deployed project. It depends on an architecture of tentatively 'blackholed' canisters, so the renouncing storage and token related smart contract over time. It is fully open-source, so the current state of decentralizion can be tracked on [Github](https://github.com/UncensoredGreats/).

The frontend will be continuously developed, and so use of backend functions from blackholed canisters will remain mutable indefinitely. Nonetheless, anyone can fork the project with an alternative frontend that's bound by the same code and data of Alexandria's universal backend canisters.

Since this model prioritizes immutability for the sake of permanence, governance is initially limited to matters involving NFT ownership. The governance mechanism allow proposals that can delete NFTs (if corrupted/inaccurate), or transfer the ownership (to any true author that claim it) with a simple majority and quorum of staked ALEX holders.


### Inspiration

'AI' was kept out of this whitepaper entirely, despite it being at the core of Alexandria's founding vision.

This project was born out of pilot project called UncensoredGreats where you'd chat with great authors in an uncensored way. There was one finding of this experiment that shaped Alexandria: When an AI is fed author words directly, and forced to answer without knowledge of the user's question, responses became far more interesting and honest. In other words, a technique to output particular human thoughts from training data rather than aggregate ones is far more conducive to discovery.

As AI models grow in size and complexity, the outputs will grow more generic, and our people-first methodology more fruitful. This direction goes against the grain of the entire AI space, but it steadfast in what we see as a longstanding principle of computer science, exemplified by the story of one early internet legend.

#### The Hyperlink Paradigm

In 1968, Doug Engelbart and his team presented "A Research Center for Augmenting Human Intellect" in San Francisco's Civic Auditorium. It introduced:

(1) A responsive human-machine interface.
(2) The computer mouse.
(3) Copy/paste and text re-organization.
(4) Hyperlinks.
(5) Real-time screen-sharing collaboration.

Most remember this as the "Mother of all Demos" for obvious reasons. What most forget about Engelbart's experience though is in the two decades preceding this demo, where he was at best refused help, and at worst outright ridiculed for holding that computers would be "tools for collaboration and augmentation" instead of Artificial Intelligence (a story best told in *What the Dormouse Said*).

During the 1950s and 60s, the entire CS field was convinced that the primary use case of computation was autonomous machines ad AI, while Doug held that computers would be tools for humans to interface with. Despite 70 years of evidence of that same trajectory, popular opinion has not budged an inch. As this decade of tech becomes the gold rush for blowing smoke with AI buzzwords, we see recent breakthroughs in AI through Engelbart's eyes, as history's next big tool that we need a human-centric interface for.

Engelbart's design was one webpage and a hyperlink for two. It's now for 200 million sites and 3.5 billion people. The design isn't perfect: Webpages change, hyperlinks disappear, both can be lost, stolen, or hacked, and neither can be truly owned or trusted.

Alexandria is a universal content bed for the internet. While the world works to make AI the perfect tool, like Dougs peers did with compute machines; we're building a control room that puts humans at their helm, just like Doug's "tools for collaboration and augmentation." Really we're just migrating Doug's stack to Web3.

Alexandria is a social graph of NFTs. Instead of navigating hyperlinks through algorithms, you'll navigate permalinks through favorite stuff of the people you know. It's a simpler, humbler approach to the online experience, but where everything is uniquely yours which might be just what the internet needs right now.

![Mother of all Demos (1968)](https://www.darpa.mil/DDM_Gallery/19968b_MOAD_619x316.jpg)
