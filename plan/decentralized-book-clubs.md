# Feature: Decentralized Book Clubs

## Summary
Time-bounded reading groups around a book or shelf. Members read together, discuss in scoped threads, and earn a group completion SBT when the club ends.

## How It Works
1. User creates a book club — picks a book, sets a time window (e.g. 2 weeks)
2. Other users join
3. Members discuss in threads scoped to the club
4. When time expires, members with 90%+ reading progress earn a completion SBT
5. Club becomes archived but viewable

## Display Locations
- New "Book Clubs" section in Lbry app — browse, create, join
- Club detail page — book, members, discussion, progress, countdown

## Affected Canisters
| Canister | Impact | Why |
|----------|--------|-----|
| perpetua | **Major** | Club lifecycle (create/join/leave/complete) — clubs are essentially time-bounded shelves with membership |
| alex_backend | **Medium** | Club-scoped discussion threads (reuses existing comment pattern, indexed by club ID) |
| nft_manager | **Minor** | Batch mint completion SBTs for qualifying members |
| icrc7_scion | **None** | Receives mint calls with club metadata |

## Dependencies
- **Proof of Engagement** — club completion checks reading progress from alex_backend

