# Feature: Librarian Staking

## Summary
Users who hit contribution thresholds earn a Librarian SBT. Librarians become stakeable — other users stake ALEX on them to earn a share of their Scion minting revenue. Higher-staked Librarians get boosted visibility.

## How It Works
1. User hits threshold (e.g. 50+ OG NFTs uploaded) → earns Librarian SBT
2. Librarians appear in a stakeable creators interface
3. Users browse Librarians and stake ALEX on ones they trust
4. When Scions are minted from a Librarian's content, stakers earn a proportional cut
5. Librarians with higher total stake rank higher in discovery feeds

## Display Locations
- New "Librarians" browse page — see all Librarians, their stats, total stake
- Staking interface — stake/unstake ALEX on a specific Librarian
- Feed/Alexandrian — stake-weighted ranking boost

## Affected Canisters
| Canister | Impact | Why |
|----------|--------|-----|
| tokenomics | **Major** | Per-Librarian stake tracking instead of just global pool — new staking/unstaking logic, reward distribution to stakers |
| nft_manager | **Medium** | Route a % of Scion minting fees to Librarian's staker pool. Also triggers Librarian SBT minting at threshold |
| feed | **Medium** | Stake-weighted ranking for Librarians in discovery feeds |
| user | **Minor** | `librarian` field already exists — could be derived from SBT ownership instead of manually set |
| icrc7_scion | **None** | Receives Librarian SBT mint calls |

## Dependencies
- **Achievement SBTs** — Librarian SBT is a high-tier achievement

## Notes
- Current tokenomics has global staking only — this adds per-entity staking which is a significant extension
- Revenue split needs careful design: what % goes to stakers vs Librarian vs burn
- The `user.librarian` boolean field already exists — this gives it on-chain economic meaning

