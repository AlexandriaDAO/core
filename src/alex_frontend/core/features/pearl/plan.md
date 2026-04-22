# Pearl — Deferred Follow-ups

1. **Canister `Pearl(String)` variant.** Add to `ItemContent` (`src/perpetua/src/storage/shelf_storage.rs`), regenerate `.did` + `declarations/`, replace the `AddItem.tsx:82` Nft workaround, add `PearlItemCard` branch in `ItemCard.tsx`, extend `ContentType` in perpetua `types.ts`/`utils.ts`, surface in the content-type filter.

2. **LBRY cost card on PearlPage.** `useMintReceipt` already exposes `cost` / `lbryFee` / `estimating`; wire them into `PearlPage.tsx` (was reverted — revisit after flow stabilizes).

3. **Real-time cost estimation.** Debounce form changes → render tape via `html-to-image` → call `pinax.estimate()` to show live cost as the user types (currently estimation only fires inside `uploadAndMint` at submit time).
