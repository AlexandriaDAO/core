# Kairos Mines Game Implementation Plan

## Developer's Honest Assessment

### Why Mines is a Great Choice

**From a developer perspective, this is genuinely one of the best games you could build:**

1. **Proven Market Success** - Mines is one of the most popular games on crypto gambling platforms (Stake.com, BC.Game, Rollbit). It consistently ranks in the top 3-5 most played games. This isn't speculation - it's battle-tested.

2. **Perfect Complexity Balance** - It's complex enough to be engaging but simple enough to implement correctly. Unlike poker (needs multiplayer), slots (needs elaborate themes), or crash games (needs real-time sync), Mines is turn-based and single-player. This means:
   - No WebSocket complexity
   - No race conditions between players
   - Each click is an independent transaction
   - Easy to test and debug

3. **Ideal for Blockchain** - The provably fair model fits ICP perfectly:
   - Server seed commitment before game = trustless
   - Client seed participation = user control
   - On-chain randomness via `raw_rand()` = verifiable
   - Users can literally verify they weren't cheated

4. **Psychology Works in Your Favor** - The "one more click" psychology is powerful:
   - Risk/reward increases with each click
   - Cashout anytime creates dopamine spikes
   - User controls mine count = perceived control
   - Small bets can yield big multipliers

5. **Low House Edge is Sustainable** - 2.5% is competitive with industry standards. Players appreciate fair odds, and volume makes up for thin margins.

### Will People Use It?

**Honestly? Yes, if you execute well.** Here's why:

- **LBRY Integration is Your Moat** - Unlike random crypto casinos, you're building into an existing ecosystem. Users already have LBRY. The friction to play is minimal.

- **ICP Gaming is Underserved** - There aren't many quality games on ICP yet. Early mover advantage is real.

- **Provably Fair on ICP is Novel** - Most blockchain games fake decentralization. True on-chain randomness with `raw_rand()` is a genuine differentiator.

**What Could Go Wrong:**
- Poor UX (slow clicks, confusing UI) - we'll make it snappy
- No mobile optimization - we should consider this
- Lack of social features (leaderboards, history) - add later

### My Confidence Level: 8/10

This is a solid choice. The math is proven, the technology fits, and the market exists. The main risk is execution quality, not concept viability.

---

## Overview
A "Mines" betting game on the Internet Computer using LBRY tokens. Players bet, reveal tiles on a 4x4 grid, avoid mines, and can cash out anytime with accumulated multipliers.

## Game Configuration
- **Grid**: 4x4 (16 tiles)
- **Mines**: User-configurable (1-15)
- **Token**: LBRY (Kairos-specific balance/subaccounts)
- **House Edge**: 2.5%
- **Cashout**: Anytime after successful clicks

---

## Architecture Decision

**Kairos-specific balance subaccounts** (NOT shared with NFT Manager)

**Rationale:**
- Isolation: Gaming funds separate from NFT funds
- Simplicity: No NFT Manager modifications needed
- Same subaccount derivation pattern as NFT Manager

**Flow:**
```
User Wallet → deposit LBRY → Kairos Subaccount → bet/win → withdraw → User Wallet
```

---

## Backend Canister Structure

```
src/kairos/
├── Cargo.toml
├── kairos.did
└── src/
    ├── lib.rs              # Init, RNG setup, export_candid
    ├── store.rs            # StableBTreeMap storage
    ├── guard.rs            # Auth guards (not_anon)
    ├── constants.rs        # GRID_SIZE=16, HOUSE_EDGE=0.025, etc.
    ├── api/
    │   ├── mod.rs
    │   ├── queries.rs      # get_balance, get_active_game, get_game_history
    │   └── updates.rs      # start_game, click_tile, cash_out, deposit, withdraw
    ├── models/
    │   ├── mod.rs
    │   ├── game.rs         # Game, GameConfig, ClickResult, CashoutResult
    │   └── balance.rs      # BalanceInfo, DepositResult, WithdrawResult
    ├── errors/
    │   └── game.rs         # GameError enum
    └── core/
        ├── mod.rs
        ├── randomness.rs   # ChaCha20 RNG seeded by raw_rand
        ├── provably_fair.rs # Hash-based mine placement
        ├── multiplier.rs   # Fair odds calculation
        └── balance.rs      # LBRY transfer operations
```

---

## Core Data Models

### Game
```rust
pub struct Game {
    pub id: u64,
    pub player: Principal,
    pub bet_amount: u64,           // e8s
    pub mine_count: u8,            // 1-15
    pub tiles: Vec<Tile>,          // 16 tiles
    pub revealed_count: u8,
    pub current_multiplier: f64,
    pub status: GameStatus,        // Active | Won | Lost
    pub server_seed_hash: String,  // Shown before game (commitment)
    pub server_seed: Option<String>, // Revealed after game
    pub client_seed: String,
    pub created_at: u64,
}
```

### GameConfig (start_game input)
```rust
pub struct GameConfig {
    pub bet_amount: u64,
    pub mine_count: u8,
    pub client_seed: String,
}
```

---

## API Endpoints

### Queries
| Endpoint | Description |
|----------|-------------|
| `get_balance()` | User's available + in-game balance |
| `get_active_game()` | Current active game (if any) |
| `get_game(id)` | Get game by ID |
| `get_game_history(limit, offset)` | Past games |
| `calculate_multiplier(mines, revealed)` | Preview multiplier |

### Updates
| Endpoint | Description |
|----------|-------------|
| `confirm_deposit()` | Confirm LBRY deposit to gaming balance |
| `withdraw(amount)` | Withdraw LBRY to main wallet |
| `start_game(config)` | Start new game (returns server_seed_hash) |
| `click_tile(game_id, tile_index)` | Reveal a tile |
| `cash_out(game_id)` | Cash out winnings (reveals server_seed) |

---

## Randomness (Provably Fair)

### RNG Initialization (lib.rs)
```rust
#[init]
fn init() {
    ic_cdk::setup();
    init_counters();
    // Async RNG init via timer
    ic_cdk_timers::set_timer(Duration::ZERO, || {
        ic_cdk::spawn(init_rng());
    });
}
```

### Mine Placement Algorithm
1. Generate random `server_seed` (32 bytes from ChaCha20)
2. Hash `server_seed` → `server_seed_hash` (shown to player before game)
3. Player provides `client_seed`
4. Combine: `SHA256(server_seed + client_seed)` → deterministic mine positions
5. After game ends, reveal `server_seed` for verification

### Multiplier Formula
```
fair_multiplier = 1 / P(surviving N clicks with M mines)
actual_multiplier = fair_multiplier × (1 - 0.025)  // 2.5% house edge
```

---

## Frontend Structure

```
src/alex_frontend/kairos/src/
├── routes/
│   └── mines/
│       ├── index.tsx
│       └── index.lazy.tsx
├── pages/
│   └── MinesPage.tsx
└── features/
    └── mines/
        ├── components/
        │   ├── MinesGrid.tsx         # 4x4 clickable grid
        │   ├── MinesTile.tsx         # Individual tile
        │   ├── BetControls.tsx       # Amount + mine count selectors
        │   ├── GameControls.tsx      # Start/Cashout buttons
        │   ├── MultiplierDisplay.tsx # Current × and potential payout
        │   ├── BalanceDisplay.tsx    # Gaming balance widget
        │   └── ProvablyFairModal.tsx # Verification UI
        ├── state/
        │   ├── minesSlice.ts         # Redux slice
        │   └── thunks/
        │       ├── startGame.ts
        │       ├── clickTile.ts
        │       ├── cashOut.ts
        │       ├── deposit.ts
        │       └── withdraw.ts
        └── types/
            └── index.ts
```

---

## Implementation Sequence

### Phase 1: Backend Foundation
1. [ ] Create `src/kairos/` directory structure
2. [ ] Add kairos to `Cargo.toml` workspace members
3. [ ] Add kairos to `dfx.json` canisters
4. [ ] Implement `lib.rs` with init and RNG setup
5. [ ] Implement `store.rs` with StableBTreeMap storage
6. [ ] Implement `guard.rs` (copy from dialectica)
7. [ ] Implement `constants.rs`
8. [ ] Implement `errors/game.rs`
9. [ ] Implement `models/` (game.rs, balance.rs)

### Phase 2: Core Game Logic
10. [ ] Implement `core/randomness.rs` (from authentication pattern)
11. [ ] Implement `core/provably_fair.rs`
12. [ ] Implement `core/multiplier.rs`
13. [ ] Implement `core/balance.rs` (LBRY operations)

### Phase 3: API Layer
14. [ ] Implement `api/queries.rs`
15. [ ] Implement `api/updates.rs`
16. [ ] Generate `kairos.did` Candid interface
17. [ ] Test canister locally with dfx

### Phase 4: Frontend State
18. [ ] Create `features/mines/types/index.ts`
19. [ ] Create `features/mines/state/minesSlice.ts`
20. [ ] Create thunks (startGame, clickTile, cashOut, deposit, withdraw)
21. [ ] Add minesSlice to root reducer

### Phase 5: Frontend Components
22. [ ] Create `MinesTile.tsx`
23. [ ] Create `MinesGrid.tsx`
24. [ ] Create `BetControls.tsx`
25. [ ] Create `GameControls.tsx`
26. [ ] Create `MultiplierDisplay.tsx`
27. [ ] Create `BalanceDisplay.tsx`
28. [ ] Create `ProvablyFairModal.tsx`

### Phase 6: Pages & Routes
29. [ ] Create `MinesPage.tsx`
30. [ ] Create `routes/mines/` route files
31. [ ] Add Mines link to navigation Tabs
32. [ ] Integration testing

---

## Key Files Reference

### Patterns to Follow
| Pattern | Reference File |
|---------|----------------|
| Canister structure | `src/dialectica/src/` |
| RNG initialization | `src/authentication/src/core/randomness.rs` |
| StableBTreeMap storage | `src/dialectica/src/store.rs` |
| Subaccount derivation | `src/nft_manager/src/id_converter.rs` |
| LBRY transfers | `core/features/balance/lbry/thunks/transfer.ts` |
| Redux slice | `core/features/balance/lbry/lbrySlice.ts` |

### New Files to Create
| File | Purpose |
|------|---------|
| `src/kairos/Cargo.toml` | Canister dependencies |
| `src/kairos/src/lib.rs` | Entry point with init |
| `src/kairos/src/core/provably_fair.rs` | Mine placement algorithm |
| `src/kairos/src/api/updates.rs` | Game operations |
| `kairos/src/features/mines/state/minesSlice.ts` | Redux state |
| `kairos/src/features/mines/components/MinesGrid.tsx` | Game grid UI |
| `kairos/src/pages/MinesPage.tsx` | Main game page |

---

## Configuration Changes

### dfx.json (add canister)
```json
"kairos": {
  "type": "rust",
  "package": "kairos",
  "candid": "src/kairos/kairos.did"
}
```

### Cargo.toml (add to workspace)
```toml
members = [
  # ... existing
  "src/kairos",
]
```

---

## Future Enhancements (Post-MVP)
- Leaderboards (daily/weekly/all-time)
- Multiplayer rooms (watch others play)
- Achievement system
- Different grid sizes (5x5, 6x6)
- Tournament mode
- Mobile-optimized UI
