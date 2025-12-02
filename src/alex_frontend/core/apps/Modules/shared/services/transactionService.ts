/**
 * Unified transaction service that handles all transaction-related operations
 * for both general content and NFT-specific use cases.
 */
import { AppDispatch } from "@/store";
import { RootState } from "@/store";
import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { fetchTransactions } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient";
import { ContentService } from "@/apps/Modules/LibModules/contentDisplay/services/contentService";
import { Transaction } from "../../shared/types/queries";
import {
  setTransactions,
  addTransaction as addTransactionAction,
  removeTransaction as removeTransactionAction,
  clearTransactions,
  clearContentData,
  setContentData,
  setLoading,
  setError,
} from "../state/transactions/transactionSlice";
import { getAssetCanister } from "../state/assetManager/utlis";
import { fetchAssetFromUserCanister } from "../state/assetManager/assetManagerThunks";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../declarations/asset_manager/asset_manager.did";

export class TransactionService {
  private dispatch: AppDispatch;
  private getState: () => RootState;

  constructor(dispatch: AppDispatch, getState: () => RootState) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  async fetchNftTransactions(arweaveIds: string[], actor: ActorSubclass<_SERVICE>): Promise<Transaction[]> {
    const operationStart = performance.now();
    const arweaveIdsString = arweaveIds.join(",");
    console.log(`[BENCH] NFT_TX_FETCH_START: ${arweaveIds.length} IDs (${arweaveIdsString})`);

    this.dispatch(setLoading(true));
    this.dispatch(setError(null));

    try {
      const state = this.getState() as RootState;
      const { selectedPrincipals } = state.library;
      
      const arweaveFetchStart = performance.now();
      console.log(`[BENCH] ARWEAVE_METADATA_FETCH_ALEXANDRIAN_START: ${arweaveIds.length} IDs (${arweaveIdsString})`);
      let transactions = await fetchTransactionsForAlexandrian(arweaveIds);
      const arweaveFetchEnd = performance.now();
      const arweaveFetchStatus = transactions && transactions.length > 0 ? 'success' : 'not_found_or_empty';
      console.log(`[BENCH] ARWEAVE_METADATA_FETCH_ALEXANDRIAN_END: ${arweaveIds.length} IDs (${arweaveIdsString}) - ${arweaveFetchStatus} - ${(arweaveFetchEnd - arweaveFetchStart).toFixed(2)}ms`);

      if (!transactions || transactions.length === 0) {
        console.warn("[TransactionService] fetchNftTransactions: No Arweave metadata found for the given IDs.");
        throw new Error("No Arweave metadata found for the NFTs.");
      }

      const userAssetCanisterPrincipal = selectedPrincipals[0]; 
      if (userAssetCanisterPrincipal && userAssetCanisterPrincipal !== 'new') {
        console.log(`[TransactionService] Checking user ${userAssetCanisterPrincipal}'s asset canister for ${transactions.length} transactions.`);
        const icpCheckOverallStart = performance.now();
        try {
          const userAssetCanisterId = await getAssetCanister(userAssetCanisterPrincipal, actor);

          if (userAssetCanisterId) {
            console.log(`[TransactionService] User ${userAssetCanisterPrincipal} has asset canister ${userAssetCanisterId}. Fetching assets...`);
            
            const icpAssetFetchAllStart = performance.now();
            let assetsFoundOnICP = 0;
            const assetFetchPromises = transactions.map(async (transaction) => {
              try {
                const result = await fetchAssetFromUserCanister(transaction.id, userAssetCanisterId);

                if (result?.blob) {
                  assetsFoundOnICP++;
                  const assetUrl = URL.createObjectURL(result.blob);
                  console.log(`[TransactionService] SUCCESS: Asset ${transaction.id} found in user canister ${userAssetCanisterId}.`);
                  return { ...transaction, assetUrl };
                } else {
                  return transaction;
                }
              } catch (individualAssetError) {
                const errorMessage = individualAssetError instanceof Error && individualAssetError.message.includes("asset not found") 
                                   ? "Asset explicitly not found by canister" 
                                   : String(individualAssetError);
                console.warn(
                  `[TransactionService] ERROR fetching asset ${transaction.id} from user canister ${userAssetCanisterId}: ${errorMessage}`
                );
                return transaction;
              }
            });
            transactions = await Promise.all(assetFetchPromises);
            console.log(`[BENCH] ICP_ASSET_FETCH_ALL_ATTEMPTED: User ${userAssetCanisterPrincipal}, Canister ${userAssetCanisterId} - ${assetsFoundOnICP}/${transactions.length} found - ${(performance.now() - icpAssetFetchAllStart).toFixed(2)}ms`);
          } else {
            console.log(`[TransactionService] User ${userAssetCanisterPrincipal} has no assigned asset canister. Skipping ICP asset check.`);
          }
        } catch (setupError) {
          console.error(`[TransactionService] Error during asset canister setup for user ${userAssetCanisterPrincipal}:`, setupError);
        }
        console.log(`[BENCH] ICP_CANISTER_CHECK_DURATION: User ${userAssetCanisterPrincipal} - ${(performance.now() - icpCheckOverallStart).toFixed(2)}ms`);
      } else {
        console.log("[TransactionService] No specific user principal for asset canister check, or principal is 'new'. Skipping ICP asset check.");
      }

      this.dispatch(setTransactions(transactions));
      
      const loadContentStart = performance.now();
      console.log(`[BENCH] CONTENT_PREPARATION_START: ${transactions.length} txs (NFT flow)`);
      await this.loadContentForTransactions(transactions);
      console.log(`[BENCH] CONTENT_PREPARATION_END: ${transactions.length} txs - ${(performance.now() - loadContentStart).toFixed(2)}ms (NFT flow)`);

      console.log("[TransactionService] fetchNftTransactions: Successfully completed.");
      console.log(`[BENCH] NFT_TX_FETCH_END: ${arweaveIds.length} IDs (${arweaveIdsString}) - success - ${(performance.now() - operationStart).toFixed(2)}ms`);
      return transactions;
    } catch (error) {
      console.error("[TransactionService] CRITICAL ERROR in fetchNftTransactions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      this.dispatch(setError(errorMessage));
      console.log(`[BENCH] NFT_TX_FETCH_END: ${arweaveIds.length} IDs (${arweaveIdsString}) - error - ${(performance.now() - operationStart).toFixed(2)}ms`);
      throw error;
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  async fetchPermasearchTransactions(
    query: string,
    owner?: string,
    cursor?: string,
    limit = 20
  ): Promise<Transaction[]> {
    const operationStart = performance.now();
    const logIdentifier = `query=${query},owner=${owner || 'any'},cursor=${cursor || 'none'}`;
    console.log(`[BENCH] PERMASEARCH_TX_FETCH_START: ${logIdentifier}`);

    this.dispatch(setLoading(true));
    try {
      const permasearchFetchStart = performance.now();
      console.log(`[BENCH] ARWEAVE_METADATA_FETCH_PERMASEARCH_START: ${logIdentifier}`);
      const transactions = await this.fetchTransactionsForPermasearch(
        query,
        owner,
        cursor,
        limit
      );
      const permasearchFetchEnd = performance.now();
      const permasearchStatus = transactions && transactions.length > 0 ? 'success' : 'not_found_or_empty';
      console.log(`[BENCH] ARWEAVE_METADATA_FETCH_PERMASEARCH_END: ${logIdentifier} - ${permasearchStatus} - ${(permasearchFetchEnd - permasearchFetchStart).toFixed(2)}ms`);
      
      if (transactions && transactions.length > 0) {
        this.dispatch(setTransactions(transactions));
        
        const loadContentStart = performance.now();
        console.log(`[BENCH] CONTENT_PREPARATION_START: ${transactions.length} txs (Permasearch flow)`);
        await this.loadContentForTransactions(transactions);
        console.log(`[BENCH] CONTENT_PREPARATION_END: ${transactions.length} txs - ${(performance.now() - loadContentStart).toFixed(2)}ms (Permasearch flow)`);
      }
      console.log(`[BENCH] PERMASEARCH_TX_FETCH_END: ${logIdentifier} - success - ${(performance.now() - operationStart).toFixed(2)}ms`);
      return transactions || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error fetching Permasearch transactions";
      console.error("[TransactionService] Error fetching Permasearch transactions:", errorMessage);
      this.dispatch(setError(errorMessage));
      console.log(`[BENCH] PERMASEARCH_TX_FETCH_END: ${logIdentifier} - error - ${(performance.now() - operationStart).toFixed(2)}ms`);
      throw error;
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  private async fetchTransactionsForPermasearch(
    query: string,
    owner?: string,
    cursor?: string,
    limit = 20
  ): Promise<Transaction[]> {
    return await fetchTransactions(
      undefined,
      this.parseQueryForContentTypes(query),
      limit,
      owner,
      cursor,
      undefined,
      undefined
    );
  }

  private parseQueryForContentTypes(query: string): string[] | undefined {
    return undefined;
  }

  async loadContentForTransactions(transactions: Transaction[]): Promise<void> {
    await Promise.all(
      transactions.map(async (transaction) => {
        const sourceForDataItem = transaction.assetUrl ? 'ic_canister' : 'arweave'; 
        try {
          const contentMetadata = await ContentService.loadContent(transaction);
          const urls = await ContentService.getContentUrls(transaction, contentMetadata);
          this.dispatch(
            setContentData({
              id: transaction.id,
              content: { ...contentMetadata, urls, source: sourceForDataItem }, 
            })
          );
        } catch (error) {
          console.error(
            `[TransactionService] Error in loadContentForTransactions for tx ${transaction.id}:`,
            error
          );
        }
      })
    );
  }

  clearAll(): void {
    this.dispatch(clearTransactions());
    this.dispatch(clearContentData());
  }

  addTransaction(transaction: Transaction): void {
    this.dispatch(addTransactionAction(transaction));
  }

  removeTransaction(id: string): void {
    this.dispatch(removeTransactionAction(id));
  }
}

let transactionServiceInstance: TransactionService | null = null;

export const getTransactionService = (
  dispatch: AppDispatch,
  getState: () => RootState
): TransactionService => {
  if (!transactionServiceInstance) {
    transactionServiceInstance = new TransactionService(dispatch, getState);
  }
  return transactionServiceInstance;
};
