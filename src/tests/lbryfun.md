Lbry.Fun PRD

### Purpose

The ALEX | LBRY Tokenomics Model was developed to address the problems with existing fair launch models:

- Bonding Curve (pump.fun) - Easily manipulated to favor the first creators/insiders.
- Liquidity Bootstrapping Pool - Fair, but mints all at once, before the public can make informed, product-based valuations.
- Proof of Work (Bitcoin) - Great, but wastes money/energy.

Alexandria used what we call the 'Fractal Harmonic Distribution (FHD)':

Fractals are mint actions: A recursive scheme of one pattern on an exponential scale where each halving requires twice the secondary token burn for the same unit of primary token minting.

Epochs follow harmonic growth, linking halving epochs to natural economic oscillations. Total supply freezes when price falls below cost to mint, and resumes when/if product value increases.

This autonomously aligns token distribution/funding with actual product development in a way that cannot be manipulated.

This model is currently open-source, but requires technical expertise to reproduce. The purpose of lbry.fun is to allow anyone to replicate this tokenomics with custom parameters in blackholed canisters.

As is the nature of permissionless software, people can use it however they want, but a social-fi memecoin launchpad is not the intention. The design is for a methodical and robust approach to cunducting a fair launch. As an agnostic tool, it should not encourage, market or otherwise promote any token.


### Architecture

lbry.fun logic is a simplified fork of lbry.app's core logic. It however makes no fork of Alexandria Tokens, and is designed to accrue all generated value back to $ALEX.

#### Core Canisters:

- frontend: A modified version of /swap page.
  - Authenticates to the same derivation origin of lbry.app (same wallets).
  - Modified with a view and support for many token pairs, not just LBRY/ALEX.
  - No 'topup'
  - Option to create a token that fills the user-selected portion of the deploy arguments.
  - Displays upcoming and live tokens. (Maybe live price feeds too from ICP swap, but this could always be changed after the fact).

- Backend: Logic for spawning new tokens.
  - Takes the parameters set by the user for a given token launch.
  - Spawns canisters, blackholes them.
  - Special rule, it cannot spawn tokens immediately but must be at least 24 hours, or more preferably 1 week ahead of time, so the frontend can display the upcoming launch and everyone can see when it will open.

- Storage:
  - Indexes launched tokens, and all their data, and all their logs, etc. I don't want this in the backend because it's really important this data doesn't get lost. It can be in one canister if it's really well architected and garenteed to not need breaking changes.

#### Spawned Canisters:

- icp_swap:
  - Removes 2/3 extra mints, so only mint the 1/3 to burners.
  - Custom params:
    - Replace hardocoded canistser ids in `utils.rs` (ALEX_CANISTER_ID, LBRY_CANISTER_ID, TOKENOMICS_CANISTER_ID)
    - I'm pretty sure everything else is going to be the same, but I could be wrong
- tokenomics:
  - Custom Params:
    - LBRY_THRESHOLDS & ALEX_PER_THRESHOLD (in storage.rs). These should be work based on a max/min slider that simulates the outcomes in graphs so the user can understand what the outcome will be.
    - pub const MAX_ALEX: u64 = 2100000000000000; // 21 million should be adjusted according to the THRESHOLDS that have been set by the user. So they don't enter this manually, but the computed value of the supply cap is shown to them, and the safety mechanism updated accordingly.
    - phase_mint_alex > 500_000_0000 (line 291 in update.rs). Should be set by the user, and should be capped very small so it's hard for first users to get too much of the supply.
    - What else are we missing here? 
- Logs: Basically what we have but remove nft stuff, and add the threshold information that would otherwise be in our whitepaper.
  - Primary Token Supply.
  - Secondary Token Supply.
  - Burned amounts.
  - Halvings.
  - Staked Amount.
  - The fixed information from the threshold setup should be shown in a simulated graph of what it would look like as halvings 
  continue.
  - Canister cycles balance in each of the spawned canisters so it can be watched by the community in-case one gets low.
- Primary and Secondary Tokens: Based on deploy parameters.


```
# We use ALEX here because it's convienent, but will be replaced with the other token's name.

# The same argument can be used for both the primary and secondary token.

dfx deploy ALEX --network ic --argument '(variant { Init = 
record {
     token_symbol = "ALEX";
     token_name = "ALEX";
     minting_account = record { owner = principal "'$(dfx canister id tokenomics --network ic)'" };
     transfer_fee = 10_000;
     metadata = vec {
        record { "icrc1:symbol"; variant { Text = "ALEX" } };
        record { "icrc1:name"; variant { Text = "User Selected Name" } };
        record { "icrc1:description"; variant { Text = "User generated descripton with whatever information they want in markdown format." } };
        record { "icrc1:decimals"; variant { Nat = 8 } };
        record { "icrc1:fee"; variant { Nat = 10_000 } };
        record { "icrc1:logo"; variant { Text = "<Actual raw encoded SVG. Must preview to the user before deploying.>" } };
     };
     initial_balances = vec {};
     archive_options = record {
         num_blocks_to_archive = 3000;
         trigger_threshold = 6000;
         controller_id = principal "'$(dfx canister id tokenomics --network ic)'";
         cycles_for_archive_creation = opt 10000000000000;
     };
     feature_flags = opt record {
        icrc2 = true;
        icrc3 = true;
     };
     maximum_number_of_accounts = opt 10_000_000;
     accounts_overflow_trim_quantity = opt 100_000;
     max_memo_length = opt 32;
 }
})'

```

### Big Economic Modifications

To launch a token should be relatively cheap. I say we just make the user pay in ICP to spawn the canisters and give them 2-5T cycles each (we'll decide together how much in each). No payment in LBRY required. Swapping, Burning, Staking, etc., also require no additional fee. It works exactly the same as the current LBRY/ALEX model.

Big Changes:

- Upon Spawning canisters, the primary token must mint with an initial supply of 1 token, and create a pool on ICPSwap that's paired with 0.1 ICP. Creating this pool costs 1 ICP, so when the token is launched on our site, it auto-generates the ICPSwap pool.

- The other big change is staking rewards. Instead of giving 100% to stakers, we split like this:
  - 1% uses our core 'swap' function to buy_back LBRY and send it to the burn address.
  - 49.5% is allocated to the pool that was created. So 1/2 of it buy's back the token, and then adds both assets to the pool. This liquidity, being provided by the icp_swap canister, is basically burned and should be impossible to remove.
  - 49.5% Goes to stakers as is standard on lbry.app.


If there are unforseen implementation challenges with this idea, we could modify accordingly. But generally speaking this is the ideal. LP grows with staking rewards so there's a nice moat for times when supply expansion stops.