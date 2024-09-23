

## Deploy locally

We have reporoducable builds coming soon. Sorry for this mess.

#### Latest network deploy: 08/10/24

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
- Install Motoko: https://mops.one/docs/install && npm i -g ic-mops
- Install azle: [latest instructions](https://demergent-labs.github.io/azle/get_started.html#installation) | `DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"` & `npx azle install-dfx-extension`



## Patterns and Standards (for contributions)

Please follow these if you add stuff.

## Adding a New Canister.

Please use the existing Typescript or Rust patterns in dfx.json.

Always name the folder, and .did file the same canister name, e.g.,

### Accessing a new Canister from the Frontend.

Add it to the following files with the existing patterns:
    (1) src/alex_frontend/src/contexts/SessionContext.tsx
    (2) src/alex_frontend/src/features/auth/utils/authUtils.tsx
    (3) src/alex_frontend/src/providers/SessionProvider.tsx

We use 2 patterns when calling actor functions: Implemented with `const { actor } = useSession();` via SessionContext.tsx or `createAsyncThunk`... via Redux? When should we use which? 

todo before next push: Fix fetchBooks.ts, fetchEngineBooks.ts, and irys.tsx

### Referencing canisters on the backend.

Use nft_manager/src/lib.rs as a reference.

Use this pattern: 

```rust
pub const ALEX_CANISTER_ID: &str = "7hcrm-4iaaa-aaaak-akuka-cai";

pub fn alex_principal() -> Principal {
    get_principal(ALEX_CANISTER_ID)
}
```

Then when you need to reference it: 
```
use crate::alex_principal;

some_function(alex_principal(): Principal) {
  ...
}
```

Rationale: This methodology is the most consise, and having all the canister ids in each Lib.rs immediately tells you what canisters it interacts with.

### Adding an app.

Add a `src/apps/your_app_name/index.tsx, and keep all supporting components in the apps folder. Eventually the good apps may move to different repos/subdomains, so the logic must be standalone. For this reason it's better to have duplicate code, that reusing/relying on parts of the main app which might have to be moved.





#### Distinguishing Blocks/Channels, NFTs & SBTs.

Looks like we've actually already figured this out.

Blocks are NFTs, Channels are SBTs.

So we'll have to make the Arweave Uploads more Generic. The app has to handle lots of different rendering methods, so we'll have the uploader preview how it displays in the block before uploading.

It's free to create a channel and you can make money from it, but to add a block to the channel you must pay that block.

Next steps - Let's just worry about making blocks and channels, not the experience yet.

Primatives for Uploader in Main Pager:

  Minting NFTs:
  - Upload a file, pre-rendering he block visually.
    - Mints as Auto-Verified: .png, .jpg, .gif, .md
    - Mints as Unverified: .epub, video-files, audio-files.
  - Configure the cost to upload, and mint the nft.
  - Perfect the NFT/DAO canister to get it handling this kind of thing.

  Minting SBTs (paying an nft for the right to use it as your own):
  - A simple list of NFT ids that are assigned to you in a b-tree map. We'll make a separate SBT canister for this.
    - You can use them forever and add them to channels and stuff later.

Rules of engaagment for experience stuff:
  - You pay the NFT to make it your own SBT.
    - Benefits: 
      - You can use it in your own profiles (e.g., channels)
      - Adding content to your proifile make it more discoverable, more money making opportunity.
      - Downloads to local as part of your personal data.
  - You use SBTs (and your own NFTs) as blocks in your own channels.