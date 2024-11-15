# Project Status: Pre-Alpha

> **IMPORTANT**: This project is in pre-alpha. The code is not audited and we make no security guarantees for any assets on this site.
>
> ⚠️ **WARNING**: It is not recommended to store large amounts of ICP or trade native tokens (ALEX/LBRY) outside of lbry.app, as they may be lost at this stage.
>
> All our code is [open-source](https://github.com/AlexandriaDAO/core) and is currently maintained by a small self-funded team. The codebase is rapidly evolving and everything is subject to change.

## Development Roadmap
pre-alpha → alpha → beta → release candidate → DAO/SNS

## Current Stage: Pre-Alpha

### Fungible Tokens (ALEX/LBRY)
- This stage focuses on stress-testing our novel tokenomics design
- Token emissions are controlled by 'icp_swap' and 'tokenomics' canisters
- **Risk Notice**: Breaking changes may occur that could affect the inflation schedule
- In case of exploits:
  - We can restore tokens using the ICRC3 archive
  - Related data (stakes, pending rewards, unremitted emissions) will be restored best-effort
  - **Important**: Any tokens traded after an exploit will not be included in recovery snapshots (why ALEX/LBRY tokens should not be traded at this stage!)

### Non-Fungible Tokens
- Currently using an unaudited [ICRC7](https://github.com/PanIndustrial-Org/icrc_nft.mo) implementation
- Protected by our [backup mechanism](https://github.com/AlexandriaDAO/backups)
- Future migration to audited implementation is planned
- While permanent storage is likely, there's a small risk of loss

## Future Stages

### Alpha
- Audit of critical tokenomics logic
- Black-holing of LBRY and ALEX tokens
- Scaled NFT backup system

### Beta
- Full audit of swap and tokenomics canisters
- Migration to audited ICRC7
- Complete authentication system

### Release Candidate
- Complete system audit
- Stable partner integration patterns
- Blackholing of stable canisters

### DAO/SNS
- Full DAO control implementation
- Team handover of canister management

