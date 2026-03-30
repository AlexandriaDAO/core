# Feature: Achievement SBTs

## Summary
Auto-minted Soulbound Tokens as badges for platform milestones. Non-transferable, permanently tied to a user's principal.

## Achievement Examples
- "First Upload" — minted your first OG NFT
- "Prolific Creator" — uploaded 10 / 50 / 100 OG NFTs
- "Popular Work" — one of your works got 100+ Scions
- "Curator" — created 10+ shelves with items
- "Bibliophile" — minted Scions from 25+ different works
- "OG Member" — account created before a certain date

## Display Locations
- User Profile page (`/dashboard/profile`) — dedicated badges section
- Alexandrian browser — achievement SBTs show up when filtering by SBT

## Affected Canisters
| Canister | Impact | Why |
|----------|--------|-----|
| nft_manager | **Major** | Achievement definitions, threshold checks, triggers minting after actions |
| icrc7_scion | **None** | Just receives mint calls — achievements are Scions with distinct metadata |
| feed | **Read-only** | Already has SBT counts per OG NFT — queried for "Popular Work" check |
| user | **Read-only** | Already has `created_at` — queried for "OG Member" check |
| perpetua | **Read-only** | Already has user shelves — queried for "Curator" check |

