# Feature: Proof of Engagement (Books)

## Summary
SBTs that prove a user finished reading a book. Reading progress tracked in the frontend, recorded on-chain, mintable as a permanent badge.

## How It Works
1. Book reader tracks reading progress (page/chapter completion)
2. Progress is periodically saved to a canister
3. At 90%+ completion, user can mint a "Finished Reading" SBT
4. One per user per book

## Display Locations
- Profile page — "Books Read" section
- NFT detail page — "X readers finished this book" (creator analytics)

## Affected Canisters
| Canister | Impact | Why |
|----------|--------|-----|
| alex_backend | **Major** | New reading progress storage and tracking (fits alongside existing views/impressions) |
| nft_manager | **Minor** | New function to mint engagement SBT after verifying completion via alex_backend |
| icrc7_scion | **None** | Receives mint calls with engagement metadata |

## Notes
- Progress tracking is client-side / trust-based — acceptable for social signals, not financial
- Feeds into Achievement SBTs ("Bibliophile" badge = completed N books)
- Scope: Books only (not Sonora/Syllogos/Dialectica)

