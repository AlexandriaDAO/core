### Latest network deploy: 
07/18

## Running the project locally

run `./scripts/build.sh`

For frontend only: `npm run dev`

Or on mainnet: Switch canister_ids.json with your own canisters and run `./scripts/network_build.sh`

#### Common Prerequisites if this fails:
(Linux)
- Install DFX: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)`
- Install NVM: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` | `nvm install --lts`
- Install Node & NPM: `sudo apt install nodejs npm`
- Update them: `sudo apt-get update
sudo apt-get upgrade nodejs`
- Ensure the latest versions: `nvm install --lts`
- Install Cargo: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Add wasm: `rustup target add wasm32-unknown-unknown`
- If in a new rust env: `Sudo apt install build-essential`


# Alexandria DAO LitePaper

### Concept

We imagine an Internet where search and social, instead of being scattered across divergent hyperlinks; all flow from one hub of linearly-linked, AI-retrievable, primary sources.

Alexandria shares the core functionality of the Big Tech Search and Social but with a few key distinctions.

Differences from Search:
There are many customizable search engines, each created, curated, and hosted soverignly by a single user.
All their source material is from Ebooks instead of Webpages (linear HTML instead of divergent HTML).
All Ebooks are owned and self-hosted by individuals as Non-Fungible Tokens (NFTs), and content generated from them owned as Soul-Bound Tokens (SBTs).

Differences from Social:

Posts are templated and AI-assisted. Users have complete freedom to use any source material but are limited in that they must use source material (ebooks).
Every content post is created from, and fixed to its primary source(s), accessible on a single page through search (no ‘infinite scroll’ or compulsive tab switching nessasary).
The content is timeless and ranking algorithms do not regaurd recency.

All raw data is hosted on-chain and owned by someone. This leads to typical Web3-native attributes like DAO Governance and Token Incentives. It costs something to host—and rewards something when used, which acts as a natural quality filter. While the potential scale of content is infinite, only the best source material is worth persisting.

In short, Alexandria is a distraction-free digital home with content ownership at its core.

The first 20 years of the Internet belonged to those companies best at capturing and leveraging user data. The next 20 will belong to whoever’s best at sorting it.

Alexandria is tackling the ‘Web3 data economy’ on a scale and with a generality of data that is wholly unfamiliar to crypto, and comprehensible only in relationship to the historical context of its Big Tech counterparts. Our approach to re-indexing the Internet is by giving individuals a place to do it and a reason to do so.

#### Problem

Hyperlinks, the 1960s invention that immortalized Web surfing as we know it; are a suboptimal medium for effectively traversing the quality, quantity, and variety of digital information that exists today.

Just ask yourself, what does it take to get a nuanced overview of any subject on the Internet? 

You generally need to click around and pass through a combination of web pages, podcasts, blogs, YouTube videos, etc. At each step, you pass through a hyperlink; leave all the findings from the last hyperlink behind, and have to sort through the irrelevant information of the next one to get new findings.

Every hyperlink that you click has been curated for you by advertisers and proprietary services, and the content of each generally comes from an unknown source with a reputation you have to guess.

Despite having a sea of endless information at our fingertips, we are no closer to knowing what is True.

LLMs like ChatGPT implement a partial fix by letting machines be the aggregators. They give quick answers but with limited knowledge of their input sources or ability to convey whatever internal bias may be at play. Since their training data is a mixed bag, LLMs are poorly equipped to represent the position of a particular person or group, and their precision diminishes in the abstract.

The Internet’s hyperlink design, paywalls, disparate hosting, and proprietary aggregators have made us completely accustomed to the shattered means through which we interface with digital information. It’s time to bring the world’s data to a single hub, and put humans at the helm of its machine aggregators. 

No matter how advanced our search and discoverty techniques get, we cannot circumvent the 1960s setup of diparite ownership whereby you cannot make full use of a hyperlink before digitally travelling to it. People need not just The Web, but Their Web.

#### Solution

The Internet from a user perspective could be thought of as disparate HTML (static sites) using custom javascript (dynamic platforms), connected via hyperlinks, and accessible through keyword-based search engines.

Alexandria could be thought of as uniform HTML (.epubs), using standardized javascript (epub.js), consecutively linked as pages, accessible through advanced full-text and vector search.

Instead of clicking through many pages across many tabs—access, save, sort, and share the world’s information on a single page.
Instead of copy/paste/reorg of site snippets in a text editor—interphase with them with whiteboards, iceberg charts, and AI.
Instead of citing sources for your work, or intentionally omitting them—have perfect providence tracking by default.
Instead of referencing the posts/links of others in your content—edit, fork, interact, or refute the originals of others on the public dashboard.

These capabilities arise because all app data, stored entirely on-chain, has an owner at every level of abstraction.

Consequently, everything from the ebook to a concise AI-generated summary is both owned by its creator and freely accessible to all. This contrasts strongly with the Web2 paradigm whereby data is treated as if owned by whoever decides to copy it.

The use of AI is restricted to pre-prompted models in DAO-approved Canisters. In this way, the AI does not know what the user asks or wants, its output cannot be biased by the user, and its authenticity can be ensured. 

That said, Alexandria AI lets you choose input from limitless source material and does everything to limit model censorship in the process. In other words, if the information you’re looking for is not in our database, and it exists somewhere, you can format it, add it, and use it without delay or permission.

The only condition though, is that source material must be an ebook (.epub), but not necessarily books in the traditional sense.

### The Internet of Books

Because the Internet is based on hyperlinking, migrating everything into ebook format sounds counterintuitive, but this does not exclude audio/video/etc. It supercharges it, allowing a universal search engine (if the content of Bing/YouTube/Spotify/etc. fell under the same roof). Here’s why and how it’s done.

The epub file standard, while having books as its primary use case, is more of an information formatting paradigm than a universal standard for digital books. Consider the concept of the codex, or the stack of pages in a single binding that we now think of as a book. Before the first century AD, every book was a scroll, and every scroll was a book. To reference something in a book, you had to find the right scroll on the right shelf and unravel it on a long table. With the codex, you could now just flip through pages. Plus you got to write on both sides of the page!

In our Internet of Books, a webpage (.html) is to a scroll as a book (.epub) is to a codex. The word book is arbitrary here in the sense that .epub files can embed audio and video like any webpage. Still, it’s helpful in the same sense as the codex: The format imposes a standard for indexing and categorizing the information inside, which in turn, makes it way easier to reference.

This contrasts strongly with the html pages of today, which are threaded together semi-randomly as fragments, hence the names Web and Net. Ebooks only thread html pages consecutively. This forces some level of logical coherence on the part of the author, which is also the reason there’s more ‘weight’ in reading/writing a book than in a blog or podcast of the same content.

To make this transition easy enough for anyone to participate, Alexandria will provide an epub conversion suite whereby members grow the epub database with any information they like. If someone wants to learn about a subject that isn’t in the existing database, they can aggregate websites, podcasts, videos, and of course books and upload them in a bundle to our service suite. What they receive back is an accordingly formatted ebook, where the original content type (audio/video) is preserved, but under the hood is converted text that makes video clips and podcast moments searchable just like any other paragraph of the book.

Users own and self-host these uploaded ebooks, including all the data and assets they contain, 100% on-chain as NFTs. These book NFTs earn revenue when others search/use/download/trade them.

If they are not the rightful owner of that intellectual property, its true author can reclaim ownership through a governance mechanism, at which point they can claim retroactive pay for all revenue generated from their content.

While Alexandria remains centralized and without DAO governance, we’ll stick to the use of conventional ebooks with embedded metadata such as publisher, ISBN, and publication date to avoid pirating copyrighted content.

### How it Works

When you arrive on Alexandria.com, you’ll see a search box with a grid of categories below that represent the active database you’re searching.

Each category opens into a library of Ebooks that you can save and read—just like Kindle, but with no downloads or payment.

As you type in the search box, or meddle with settings, the category grid reorganizes in real time; always reflecting the active part of the database you’re searching.

Your search results return the most related sources from various books. These sources can be collected, customized, and always point to an E-book location; much like the annotation feature of a typical e-reader.

You can add a group of collected sources in a post using pre-prompted AI functions that analyze the text. 

You can use different AI functions to ‘decorate’ your group of sources with different summarization/sentiment-analysis techniques. Making these posts public turns them into Soul-Bound-Tokens that rewards you when others interact with it.

The underpinnings of this high-level experience can be understood as four low-level components:

Read (NFTs)
Search (Vector DB)
Create (AI)
Post (SBTs)

#### Read
Alexandria is first and foremost a library. All its books are available to read on-site.

These books come from a portal where a user uploads an ebook and mints it as an NFT.

These book NFTs contain (1) the .epub file itself, (2) an autogenerated .csv of the book’s parsed data, (3) and the embedded metadata (title, author, publisher, ISBN, etc.).

The associated .csv file is converted to a vector database cluster, of which the Book NFT becomes the key through which it is accessed.

#### Search
The associated .csv file is separated by paragraph and added to a Qdrant-based VectorDB, of which the Book NFT is the access key.

The main site search bar navigates the VectorDB and returns the series of sources with the closest semantic meaning to the input query. These are distinct UI cards, about a paragraph in length.

Sources open into the highlighted ebook section via the ebook. Users can change this highlighted section to adjust the source, making these like e-reader annotations/bookmarks that can be saved and shared as the site’s base content unit.

#### Create
Sources can be gathered and combined with pre-configured AI functions build-your-own-post kind of fashion.

Posts take a variety of user-selected input sources, from any combination of books, and use pre-prompted AI functions to populate the post with a title, description, summary, sentiment analysis, etc.

The structure and style of posts will change over time to match different use cases, but the core idea is to have AI take a series of ideas, related or unrelated, uniform or contradictory, literal or allegorical, and provide the insights that offer an unbias glimpse into what the provided sources convey.

Posts can be bookmarked by others, which rewards ALEX, and can also be commented on by others, but there are no other attributes, e.g., likes/dislikes/flag, and of course, no censorship.

#### Post
Posts are built around this idea of leveled abstraction for infinite ideas. At the highest level, a single headline. At the lowest level, all the parts of all the primary sources that idea comes from.

Users are free to stay as shallow or go as deep as they like, all in a single place.

This abstractive hierarchy is also applied to where posts are contained as well in a manner inspired by icebergcharts.com: Where a given subject is ‘the iceberg meme’, and hyperlinks to its constituent topics are added to iceberg based on perceived ‘depth’. Except here, we use posts instead of hyperlinks.

These charts can be either public and collaborative or completely private. Their search visibility is fixed alone to popularity (#bookmarks) and the raw text content itself (visibility does not decay with time).

### Tokenomics

Alexandria will have a native token, UC with a fixed supply of 21 Million.

We honor Satoshi’s example concerning the hard cap, supply distribution, minting mechanism, and general philosophy of hard money (we hope).

#### Distribution
21 Million ALEX, or 100% of the supply, will be initially allocated to the rewards pool, and have to be ‘mined’.

The ALEX treasury will have tapering emissions based on interactions with books and posts to those who created them. It’s similar to Bitcoin’s proof of work mining, except the ‘work’ is done by humans who make, read, and synthesize books (instead of computers that solve math puzzles).

The token has no initial utility or function and has no reason to increase in value.

The following token-related plans are speculative, have no guarantee of being implemented, and will remain subject to change while project development is under centralized control.

#### Utility
Out of the gate, ALEX will have zero utility or intrinsic value.

ALEX's intended utility is only relevant as Alexandria moves toward architectural decentralization. 

As Alexandria moves towards DAO form, ALEX's utility will be restricted to staking and governance.

In staking, holders will have full rights to revenue earned on the platform.

In governance, voters will have full rights over platform code changes.

Staking and voting may be related/intertwined, or not.

ALEX will have no other purpose. No platform perks, payment, or other in-app functions.

#### Revenue

Premium features are paid with the app-native ALEX wallet. These will be autonomous nano payments in $ICP and potentially other hard assets like $ckBTC.

4 actions require payment:

- Semantic search results, charged per result.
- AI functions, charged per 1k-tokens of the given model.
- Royalties on NFT Trading, of course.
- Minting NFTs, charged based on file size (.epub).

New users will receive a 0.1 ICP sign-up bonus which should be plenty to get them going as the price of such actions is in the fractions of a penny. Read access to all data, including posts and Ebooks themselves, is always free.

The revenue from these actions will either go to the NFT owner as a reward or the Alexandria Team. Later, this team share is aimed at being distributed as revenue to DAO Stakers and the Cycles Wallets that pay for computation.

- Semantic Search: 40% Team / 60% NFT Owner.
- Fees on AI Functions: 60% Team / 40% NFT Owner.
- Ebook NFT trading: 5% Team / 95% NFT Owner.
- Cost to Mint Ebook NFTs: 100% to Team.

The Team will be responsible for the payment for hosting all this data and platform upkeep while the project is in the Beta (centralized) phase. All team revenue allocations and expenses are aimed going completely to the DAO after this phase.

There is a TBD DAO mechanism for retroactive pay to all authors who’ve had their books pirated, so they can reclaim whatever money was earned from their book, as well as ownership of that book.

#### Rewards

95% of the supply is locked in a rewards pool exclusively accessible with a bookmarked() function, the sole mechanism for releasing ALEX. 

`bookmarked()`’s job is simple. It moves ALEX from the pool to the wallet of the owner of a post that some other user just bookmarked. That’s it!

The amount of ALEX released each time `bookmarked()` is called will start off high and decrease overtime in a taper effect similar to that of Bitcoin Mining.

Since a new user has the freedom to bookmark endless posts, the value-bearing bookmark actions are only triggered when certain conditions are met by in-app spending.

When a user spends a threshold amount (~1 cent), one of their future bookmarking actions, of another’s post will trigger `bookmarked()`.

Users accrue these value-bearing bookmarks with organic platform spending only (not NFT Minting/Trading). Randomness and decay rules are applied to users' bookmarking actions to prevent gaming of the system.

Why 1 cent? Well, the planned launch will be with 5% of the supply (team share), and 1,000 ICP which would set the initial price of ALEX at 1 cent (at $10 ICP). This sets a ‘floor’ for what can trigger `bookmarked()` function and maintains sustainability throughout the emissions.

Initially, the team retains control of that threshold. It can be 1/50th of a cent spent, or 50 cents, to release 1 ALEX. So the team indirectly controls the rewards emissions rate, but never to whom it’s distributed. That decision is completely left to high-value users who bookmark stuff. Eventually, this spending threshold will be set to match an exponential emissions curve, just like BTC’s mining rewards.

In this way, ALEX is a completely fair launch based on intellectual (not monetary) contribution. If no one uses the platform in a way that generates the revenue required to offset token devaluation, the token supply will simply not devalue. 

So instead of raising money by launching a token to build a product, we built a product that launches a token as it raises money. We plan to set a new standard for fair launches.

### Inspiration
In 1968, Doug Engelbart and his team presented “A Research Center for Augmenting Human Intellect” in San Francisco’s Civic Auditorium. It introduced:

(1) A responsive human-machine interface.
(2) The computer mouse.
(3) Copy/paste and text re-organization.
(4) Hyperlinks.
(5) Real-time screen-sharing collaboration.

Most remember this as the “Mother of all Demos” for obvious reasons. What most forget about Engelbart’s story though, is the two decades preceding this demo, where he was at best, refused help, and at worst outright ridiculed by colleagues for holding that computers would be “tools for collaboration and augmentation of collective intelligence.”

During the 1950s and 60s, the entire CS field was convinced otherwise: That the primary use case of computation would be restricted to autonomous machines and artificial intelligence. Despite the last 70 years of evidence to the contrary, the modern equivalent of popular opinion seems to have not budged an inch. 

AI research since then has proceeded intending to emulate the human brain. That is until the Transformer Model breakthrough from 2017’s Attention is All You Need Paper. While most see this moment as the stepping stone to AGI, we see, through Engelbart's eyes, history repeating itself.

Alexandria is not an AI startup. We don’t seek to change the field, but use it to do with the ‘AI’ of today what Engelbart did with the ‘AI’ of his day: Create a unified virtual sphere for human collaboration on anything and everything.

Engelbart’s 50-year-old design was first a single page used by two people. It now extends to 200 million sites and 3.5 billion people. Along the way, hyperlinks became immortalized at the root, search engines their gateway; and the Internet, an infinite sea, explorable one click at a time.

We now have the means to host, store, access, and transform all the Internet’s high-quality data in one single-page application. Along the way, ebooks become immortalized at the root, vector search their gateway; and LLMs, the perfect navigators to guide us through the infinite sea.

![Mother of all Demos (1968)](https://www.darpa.mil/DDM_Gallery/19968b_MOAD_619x316.jpg)
