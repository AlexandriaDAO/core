## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

### Typical Prereq Commands:
(WSL Ubuntu)
- Install DFX: `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)`
- Install NVM: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash` | `nvm install --lts`
- Install Node & NPM: `sudo apt install nodejs npm`
- Update them: `sudo apt-get update
sudo apt-get upgrade nodejs` 
- Ensure the latest versions: `nvm install --lts`
- Install Cargo: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Add wasm: `rustup target add wasm32-unknown-unknown`


# UncensoredGreats DAO LitePaper

### Project Concept

UncensoredGreats imagines a world where digital information, instead of being scattered across hyperlinked web pages, is unified in a single-page application, powered by AI, with humans guiding the process. This model reimagines the internet as a collection of standardized, interconnected html pages, akin to ebooks, navigated through intuitive UI cards that call AI functions on a drag-and-drop whiteboard.

This paradigm allows for seamless access, organization, and sharing of global information on one platform, fostering an ecosystem where data is not just consumed but interacted with, challenged, and contributed to by users. It's a bold step towards an interconnected digital realm, where knowledge is not just passively received but actively shaped and owned by its contributors.

#### Problem

Hyperlinks, the 1960s invention that immortalized Web surfing as we know it; is insufficient in effectively traversing the quality, quantity, and variety of digital information that exists today.

Just ask yourself, what does it take to get a nuanced overview of any subject on the Internet? 

You generally need to click around and pass through a combination of web pages, podcasts, blogs, YouTube videos, etc. At each step, you pass through a hyperlink; leave all the findings from the last hyperlink behind, and have to sort through the irrelevant information of the next one to get new findings. Every hyperlink that you click has been curated for you by advertisers and proprietary services, and the content of each generally comes from an anonymous owner who doesn’t cite sources.

Despite having a sea of endless information at our fingertips, just carving out some virtual space to aggregate a single coherent and cross-referenced argument is impracticable.

LLMs like ChatGPT implement a partial fix by letting machines be the aggregators. They give quick answers but with no primary sources or ability to convey what internal bias may inform their answers. Since their training data is a mixed bag, LLMs are poorly equipped to represent the position of a particular person or group, and their precision diminishes in the abstract.

The Internet’s hyperlink design, paywalls, disparate hosting, and proprietary aggregators have made us completely accustomed to the shattered means through which we interface with digital information. It’s time to bring the world’s data to a single-page application, and put humans at the helm of these machine aggregators.

#### Solution

The Internet today could be thought of as disparate html pages (static sites) using custom javascript (dynamic platforms), connected via hyperlinks, and accessible through keyword-based search engines.

UncensoredGreats could be thought of as uniform html pages (.epubs), using standardized javascript (epub.js), connected via UI cards, and accessible through a single AI search engine.

Instead of clicking through many pages across many tabs—access, save, sort, and share the world’s information on a single page.
Instead of copy/paste/reorg of site snippets in a doc—bookmark findings in a whiteboard and reorg with AI.
Instead of citing sources for your work, or simply ignoring it—have perfect providence tracking by default.
Instead of referencing the posts/links of others in your own content—edit, fork, interact, or refute the originals of others on the public dashboard.

These capabilities arise because all app data, stored entirely on-chain, has an owner at every level of abstraction. Consequently, everything from the ebook to a concise AI-generated summary is both owned by its creator and freely accessible to all.

The use of AI is restricted to the models and prompt specs of DAO Canisters only. In this way, the AI has no knowledge of what the user asks or wants, and so its output cannot be biased by the input. Rather, UncensoredGreats AI uses information from and about the books you’ve pulled from to generate replies based purely on the words of authors.

### The Internet of Books

Because the whole internet is based on hyperlinking, migrating everything into ebook format sounds counterintuitive. Here’s why and how it’s done.

Ebooks, or the epub file standard, has little to do with books. That’s just their primary use case. A 100-page ebook is better thought of as 100 threaded hyperlinks. It can host audio and video embeddings like any website, but that content is logically indexed and categorically segmented so it can be read linearly.

This contrasts strongly with the html pages of today, which are threaded together semi-randomly as fragments, hence the names Web and Net. Ebooks only thread html pages in a straight line, ensuring all data retains the logical coherence of a monograph.

The DAO will provide an epub conversion service suite whereby members grow the epub database database, e.g., if someone wants to learn about a subject that isn’t in the existing database, they can aggregate a number of websites, podcasts, youtube videos, and of course books; and upload them to our service suite which then converts and refines all that data into ebooks.

Users own and self-host these uploaded ebooks, and earn when others use them. If they are not the rightful owner of that intellectual property, it’s true author can reclaim ownership via a DAO proposal, at which point they are also paid retroactively for all revenue generated from their book.

### Tokenomics

UncensoredGreats will have a native token, UC with a fixed supply of 21 Million.

We honor Satoshi’s example concerning the hard cap, supply distribution, minting mechanism, and general philosophy of hard money (we hope).

#### Distribution

Rewards Pool: 19.95M (95%)
Initial Liquidity (Team): 1.05M (5%)

The token has no guarantee of utility/intrinsic value and should not be expected to increase in value.

The following plans are speculative, have no guarantee of being implemented, and will remain subject to change while project development is under centralized control.

#### Utility

Out of the gate, UCG will have zero utility or intrinsic value.

UCG's intended utility is only relevant as UncensoredGreats moves toward architectural decentralization. 

As UncensoredGreats moves towards DAO form, UCG's utility will be restricted to staking and governance.

In staking, holders will have full rights to revenue earned on the platform.

In governance, voters will have full rights over platform code changes.

Staking and voting may be related/intertwined, or not.

UCG will have no other purpose. No platform perks, payment, or other in-app functions.

#### Revenue

Premium features are paid with the app-native UCG wallet. These will be autonomous nano payments in $ICP and potentially other hard assets like $ckBTC.

4 actions require payment.

Semantic search results, charged per result.
AI functions, charged per 1k-tokens of the given model.
Royalties on NFT Trading, of course.
Minting NFTs, charged based on file size (.epub).

New users will receive a 0.1 ICP sign-up bonus which should be plenty to get them going as the price of such actions is in the fractions of a penny. Read access to all data, including posts and Ebooks themselves, is always free.

The revenue from these actions will either go to the NFT owner as a reward or the UncensoredGreats Team. Later, this team share is aimed at being distributed as revenue to DAO Stakers and the Cycles Wallets that pay for computation.

Semantic Search: 40% Team / 60% NFT Owner.
Fees on AI Functions: 60% Team / 40% NFT Owner.
Ebook NFT trading: 5% Team / 95% NFT Owner.
Cost to Mint Ebook NFTs: 100% to Team.

There is a TBD DAO mechanism for retroactive pay to all authors who’ve had their books pirated, so they can reclaim whatever money was earned from their book, as well as ownership of that book.

#### Rewards

95% of the supply is locked in a rewards pool exclusively accessible with a bookmarked() function, the sole mechanism for releasing UCG. 

`bookmarked()`’s job is simple. It moves 1UCG from the pool to the wallet of the owner of a post that some other user just bookmarked. That’s it!

Since a new user has the freedom to bookmark endless posts, the value-bearing bookmark actions are only triggered when certain conditions are met by in-app spending.

When a user spends a threshold amount (~1 cent), one of their future bookmarking actions, of another’s post will trigger `bookmarked()`.

Users accrue these value-bearing bookmarks with organic platform spending only (not NFT Minting/Trading). Randomness and decay rules are applied to users' bookmarking actions to prevent gaming of the system.

Why 1 cent? Well, the planned launch will be with 5% of the supply (team share), and 1,000 ICP which would set the initial price of UCG at 1 cent (at $10 ICP). This sets a ‘floor’ for what can trigger `bookmarked()` function and maintains sustainability throughout the emissions.

Initially, the team retains control of that threshold. It can be 1/50th of a cent spent, or 50 cents, to release 1 UCG. So the team indirectly controls the rewards emissions rate, but never to whom it’s distributed. That decision is completely left to high-value users who bookmark stuff. Eventually, this spending threshold will be set to match an exponential emissions curve, just like BTC’s mining rewards.

In this way, UCG is a completely fair launch based on intellectual (not monetary) contribution. If no one uses the platform in a way that generates the revenue required to offset token devaluation, the token supply will simply not devalue. 

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

AI research since then has been seen with the goal of emulating the human brain. That is, until the Transformer Model breakthrough from 2017’s Attention is All You Need. While most see this moment as the stepping stone to AGI, we see, through Engelbarts eyes, history repeating itself.

UncensoredGreats is not an AI startup. We don’t seek to change the field, but use it to do with the ‘AI’ of today what Engelbart did with the ‘AI’ of his day: Create a unified virtual sphere for human collaboration on anything and everything.

Engelbart’s 50-year-old design was first a single page used by two people. It now extends to 200 million sites and 3.5 billion people. Along the way, hyperlinks became immortalized at the root, search engines their gateway; and the Internet, an infinite sea, explorable one click at a time.

We now have the means to host, store, access, and transform all the Internet’s high-quality data in one single-page application with AI as the aggregator. Along the way, ebooks become immortalized at the root, vector search their gateway; explorable through LLM synthesizers.

![Mother of all Demos (1968)](https://www.darpa.mil/DDM_Gallery/19968b_MOAD_619x316.jpg)
