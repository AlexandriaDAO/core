

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

<!-- ### Accessing a new Canister from the Frontend.

Add it to the following files with the existing patterns:
    (1) src/alex_frontend/src/contexts/SessionContext.tsx
    (2) src/alex_frontend/src/features/auth/utils/authUtils.tsx
    (3) src/alex_frontend/src/providers/SessionProvider.tsx

We use 2 patterns when calling actor functions: Implemented with `const { actor } = useSession();` via SessionContext.tsx or `createAsyncThunk`... via Redux? When should we use which? 

todo before next push: Fix fetchBooks.ts, fetchEngineBooks.ts, and irys.tsx -->

### Creating and Using Actors

To integrate actors into your project, follow these steps:

1. **Create a Context:**
   - Create a context in `src/contexts/actors/`.
   - Re-export the context in `src/contexts/actors/index.tsx`.

2. **Create a Helper Hook:**
   - Create a helper hook in `hooks/actors/`.
   - Re-export the hook in `hooks/actors/index.tsx`.

3. **Create an Actor Provider Component:**
   - Create an actor provider component in `src/actors/`.
   - Re-export the actor provider component in `src/actors/index.tsx`.

4. **Wrap Components with Actor Provider:**
   - Wrap the component that needs the actor with the actor provider created in the previous step.
   - An example can be seen in `src/providers/ActorProvider.tsx`, where instead of nesting the actors, we compose them, which is essentially the same thing.

5. **Access the Actor in the Component:**
   - Use the `useActor` hook you created in the second step to access the actor in your component.

  Additionally, in order to access the actor in the redux thunks, common pattern would be to pass as argument to the thunk.

### Referencing canisters on the backend.

The registry canister handles all canister ids so they shouldn't be hardcoded anywhere.

Use this pattern: 

```
pub const REGISTRY_CANISTER_ID: &str = "uxyan-oyaaa-aaaap-qhezq-cai";

pub async fn get_canister_id(canister_name: &str) -> Principal {
    // Call get_registry_principal from registry canister
    ic_cdk::call::<(String,), (Principal,)>(
        Principal::from_text(REGISTRY_CANISTER_ID).unwrap(),
        "get_registry_principal",
        (canister_name.to_string(),),
    )
    .await
    .expect("Failed to get canister ID")
    .0
}

get_canister_id("TOKENOMICS").await
```

This way the only hardcoded canister id is the registry canister id, which will never change.

It's preferable to put this in the lib.rs file so we know what canisters each canister interacts with very easily.

<!-- ```rust
pub const ALEX_CANISTER_ID: &str = "ysy5f-2qaaa-aaaap-qkmmq-cai";

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
``` -->

Rationale: This methodology is the most consise, and having all the canister ids in each Lib.rs immediately tells you what canisters it interacts with.

### Dynamic Imports (webpack chunking)

Use the pattern in nsfwjs/nsfwImports.tsx. It was used to dynamically import TensorFlow with much success.

```
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
```

The key is that we import TensorFlow directly in the module where it's used (nsfwService), but webpack is still able to code-split it because:

```
{
  test: /[\\/]node_modules[\\/](@tensorflow|tfjs-core|tfjs-backend-.*|tfjs-converter)[\\/]/,
  sideEffects: true,
}
```

The key insight was that we don't need to manually handle the dynamic import - webpack's code splitting handles that automatically when the module is only imported in code that's itself dynamically loaded (like the Permasearch component).

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
