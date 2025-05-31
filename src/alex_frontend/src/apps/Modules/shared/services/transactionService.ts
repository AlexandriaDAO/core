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
  CachedContent,
  ContentUrlInfo,
} from "../../LibModules/contentDisplay/types";
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
import { getActorUserAssetCanister } from "@/features/auth/utils/authUtils";
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
    console.log(`[TransactionService] fetchNftTransactions: Starting for ${arweaveIds.length} Arweave IDs.`);
    this.dispatch(setLoading(true));
    this.dispatch(setError(null));

    try {
      const state = this.getState() as RootState;
      const { selectedPrincipals } = state.library;
      let transactions = await fetchTransactionsForAlexandrian(arweaveIds);

      if (!transactions || transactions.length === 0) {
        console.warn("[TransactionService] fetchNftTransactions: No transactions found from Arweave for the given IDs.");
        throw new Error("No transactions found for the NFTs from Arweave");
      }

      const userAssetCanisterPrincipal = selectedPrincipals[0]; // Assumes this is the target user for IC check
      if (userAssetCanisterPrincipal && userAssetCanisterPrincipal !== 'new') {
        console.log(`[TransactionService] Checking user ${userAssetCanisterPrincipal}'s asset canister.`);
        try {
          const userAssetCanisterId = await getAssetCanister(userAssetCanisterPrincipal, actor);
          if (userAssetCanisterId) {
            console.log(`[TransactionService] User ${userAssetCanisterPrincipal} has asset canister ${userAssetCanisterId}.`);
            const assetActor = await getActorUserAssetCanister(userAssetCanisterId);
            
            const assetFetchPromises = transactions.map(async (transaction) => {
              try {
                const assetKeyInCanister = `/arweave/${transaction.id}`;
                const result = await fetchAssetFromUserCanister(assetKeyInCanister, assetActor);

                if (result?.blob) {
                  const assetUrl = URL.createObjectURL(result.blob);
                  console.log(`[TransactionService] SUCCESS: Asset ${assetKeyInCanister} found in user canister ${userAssetCanisterId}.`);
                  return { ...transaction, assetUrl };
                } else {
                  console.log(`[TransactionService] Asset ${assetKeyInCanister} NOT found in user canister ${userAssetCanisterId}.`);
                  return transaction;
                }
              } catch (individualAssetError) {
                const errorMessage = individualAssetError instanceof Error && individualAssetError.message.includes("asset not found") 
                                   ? "Asset explicitly not found by canister" 
                                   : String(individualAssetError);
                console.warn(
                  `[TransactionService] ERROR fetching asset with ArweaveID ${transaction.id} (expected key: /arweave/${transaction.id}) from user canister ${userAssetCanisterId}: ${errorMessage}`
                );
                return transaction;
              }
            });
            transactions = await Promise.all(assetFetchPromises);
          } else {
            console.log(`[TransactionService] User ${userAssetCanisterPrincipal} has no assigned asset canister.`);
          }
        } catch (setupError) {
          console.error(`[TransactionService] Error during asset canister setup for user ${userAssetCanisterPrincipal}:`, setupError);
        }
      } else {
        console.log("[TransactionService] No specific user principal for asset canister check, or principal is 'new'. Skipping IC check.");
      }

      this.dispatch(setTransactions(transactions));
      await this.loadContentForTransactions(transactions); // This will use Arweave if assetUrl is not set from IC

      console.log("[TransactionService] fetchNftTransactions: Successfully completed.");
      return transactions;
    } catch (error) {
      console.error("[TransactionService] CRITICAL ERROR in fetchNftTransactions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      this.dispatch(setError(errorMessage));
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
    this.dispatch(setLoading(true));
    try {
      const transactions = await this.fetchTransactionsForPermasearch(
        query,
        owner,
        cursor,
        limit
      );
      if (transactions && transactions.length > 0) {
        this.dispatch(setTransactions(transactions));
        await this.loadContentForTransactions(transactions);
      }
      return transactions || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error fetching Permasearch transactions";
      console.error("[TransactionService] Error fetching Permasearch transactions:", errorMessage);
      this.dispatch(setError(errorMessage));
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
    const contentTypes = this.parseQueryForContentTypes(query);
    return await fetchTransactions(
      undefined,
      contentTypes,
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
    // This service primarily uses ContentService, which defaults to Arweave or uses provided assetUrl
    // Minimal logging here unless specific to TransactionService decisions
    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          // ContentService will use transaction.assetUrl if it was populated from IC canister by fetchNftTransactions
          const content = await ContentService.loadContent(transaction);
          const urls = await ContentService.getContentUrls(transaction, content);
          this.dispatch(
            setContentData({
              id: transaction.id,
              content: { ...content, urls },
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
