# Alexandria WhitePaper

The Internet has come to rely almost exclusively on Big Tech services as its information aggregators. This works well for current events, but leaves behind the content-rich information of the past. 95-99% of digital content resides in the ‘deep web’, inaccessible through conventional means. Consequently, digital content that isn’t (1) search-engine optimized, (2) open-access, and (3) brand new, is basically lost forever.

There’s a big ownership problem at the center of this that causes the Internet to be structured this way. Search engines don’t actually own what they point to, nor social platforms what they display, nor cloud providers what they host. Yet, they will leverage possession of such data to block others from using it, and ignoring the rights of its original creator. 

Web3 is the dream of an Internet where digital information has intrinsic ownership. This has been achieved for money, e.g., Bitcoin; and to some extent for art with NFTs, but not yet for generic content.

The holdup is understandable. To give true ownership to a file or peice of text, you basically need to keep the original fixed supply of one while being able to distribute it infinitely. Put simply, you need to recreate the search, social, and hosting elements around making use of that original copy—so that’s what we’re doing.

Alexandria is a library in cypherspace with all its information owned by individuals in the network, much like Bitcoin except for generic content instead of money. This begins with ebooks being owned and used as NFTs, but continues with any file type (video, audio, etc.), used in a suite of Open Internet Services.

This whitepaper is broken into two parts. The first describes the network infrastructure itself, and the second describes how it's used in partner dapps.

## Contents

intro

### Part 1: Network Infrastructure

Alexandria is the Web3 library we've been talking about. It indexes everything keeps track and gives everyone the tools to find stuff, but it also keeps track of everything that's lent out of the library.

- Librarians
  - Each app will have its own rules for signup, but at the protocol layer, you participate as a librarian.
  - Users mint their principal and can then save different sets of keys (secured with VetKeys).

- LibModules
  - Define LibModules - Building blocks that people use to do stuff in apps.
    - ArWeave (complete)
    - MeiliSearch (complete)
    - Qdrant (incomplete)
    - AI  (incomplete)
    - Bittorrent/IPFS (incomplete)

- Interplay between Librarians and Libmodules.
  - Vetkeys secured
  - All are provided by and paid for by users. Alexandria is the protocol that defines and enforces the standards by which others can host LibModules. It does not itself provide any of these LibModules.
  - They're plug and play so anyone can not only use them but, build custom versions.
  - Nanopayment system handled usage based payment in the background.


### Part 2: Token Economics and Mechanics
Two tokens. LBRY for payment, ALEX for revshare.

- LBRY Mechanics
  - Mint rules: 1:1000 ratio.
  - Librarians have 2 accounts, etc.
  - Paid LibModules, all of which goes to the provider.
  - Paid NFTs and SBTs when used in submodules, all of which goes to the NFT itself.
  - Burn rules: Each burn mines a block.

- ALEX Distribution Mechanics
  - Mining distribution. (Updated chart to come soon)
  - LBRY mint mechanism. 
    - Every burn mints one block to the burner, and one to a Librarian.
  - Every time a librarian gets paid in library, their reputation increases.
    - I don't know how we're going to track this just yet, but that's the idea. Ask Adil maybe?
    - We'll apply a kind of points system that attributes reputation for their contributions.
    - Perhaps we'll apply the same standard to regular users for creating/saving stuff? i.e., Everyone's a librarian.

- Token Economics and Utility (TOKENOMICS SECTION maybe)
  - It will take 50B actions for the supply to fully emit. Some words on decentralization
  - There's no utility other than voting. There's no value other than staking.

- Governance (GOVERNANCE SECTION)
  - Initially it will just determine who owns what NFT.
  - The development will remain admittedly centralized, based on sheer complexity.
    - Things can go wrong, forks can occur, etc.
    - But the token stuff will be fair, blackholed, and rightfully forkable (decentralized).
  - SNS launch or fork are possibilies, but it's unclear what aditional canisters will be handed to the DAO, blackholed, or otherwise stay under centralized management.
    - The road to decentralization is paved with hypocracy. At least I'm being honest about it.

### Part 3: Non-Fungible Tokens Economics And Mechanics
Every saved peice of content is owned by someone.

- NFT & SBT Minter 
  - Protocol level minter that uses the ArWeave LibModule
  - Present stage (ebooks only).
    - ArWeave Nodes | Only Books | X,Y, & Z metadata fields.
  - Future Stage (podcasts, youtube videos, music, and movies).
    - Bittorent, IPFS, and other enforably tamperproof asset storage 
  - Once created they are stored forever, and become part of the Index Tree for books, and immediately accessable to all ecosystem dapps.

- Combating Copyright Infringement.
  - NFT Contains an actual wallet that locks LBRY.
  - DAO approves controls key attributes of the NFT, and retains power to transfer.
  - I.e., pirated copy waits until owner comes to claim it, then transfers it, then verifies it and pays the true owner.

- Decentralization (we might not need this. Just enough to explain copyright stuff.)
  - This is a rudimentary DAO, and the only nessasary setup to decentralize now. The rest of the architecture, variable pricing, and code updates, are not configured to this DAO. 
  - The goal is to decentralize key elements with canister either by 'blackholing' and keeping Alexandria enforcably forkable at all times, or by canister control to the SNS or an SNS fork. At this stage though, it makes most sense to blackhole the token logic and leave the buisiness logic mutable because it will likely require years of itteration.
  - Explain why others can fork, or use their own version, and that's okay because they wouldn't want to.

### Part 4: Ecosystem (basically the existing whitepaper).

- Becoming a Librarian
  - First experience looks like an app store.
  - Apps will each have their own buisiness models and onboarding, but the apps we start with will be directly connected to the Librarian system.
  - COLLECT section (or part about authenticating librarians)

- Flagship App - Bibliotheca (library)
  - Peruse - New users see search engines.
  - Read - New users search read stuff.
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

### Internet of Books
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

![][image1]

These search engines owned by other users we call *Librarians* (those who’ve registered their principal).  
![][image2]

### Read

A first interaction with Alexandria might feel akin to Google Search for Kindle—except all the search engines are owned by users and all the books are free.  
![][image3]

All books used are owned as NFTs. Alexandria does not own or hold them. Rather, *Librarians* (NFT owners) ‘rent’ read access of their .epub file to our canisters, which is how we make them free to read.

![][image4]  
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
![][image5]

### Aggregate

With the ebook hosting handled with Drive, and file access handled by NFTs; aggregating that ebook data becomes simple.

In the Librarian’s portal, a user can add or remove books from their custom search engine with a single click. When ready, it can be published and public to others, or optionally remain private to the creator.  
![][image6]  
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
![][image7]

Instead of block mining though, ALEX emits based on *favorites*. As a user spends/burns LBRY to save bookmarks, their *favorite* action becomes value-bearing. Users can favorite their own bookmarks, or the bookmarks of others, with caps and mechanisms to prevent bots.

ALEX can be added to the staking pool to passively earn a share of Alexandria revenue. Staked ALEX also grants optional voting rights, but participation does not impact rewards. ALEX does not have any other utility or function.

### Governance

UncensensoredGreats is currently a centrally developed and deployed project. It depends on an architecture of tentatively ‘blackholed’ canisters, so the renounching storage and token related smart contract over time. It is fully open-source, so the current state of decentralizion can be tracked on [Github](https://github.com/UncensoredGreats/).

The frontend will be continuously developed, and so use of backend functions from blackholed canisters will remain mutable indefinitely. Nonetheless, anyone can fork the project with an alternative frontend that’s bound by the same code and data of Alexandria’ universal backend canisters.

Since this model prioritizes immutability for the sake of permanence, governance is limited to matters involving NFT ownership. The governance mechanism allow proposals that can delete NFTs (if corrupted/inaccurate), or transfer the ownership (to any true author that claim it) with a simple majority and quorum of staked ALEX holders.







