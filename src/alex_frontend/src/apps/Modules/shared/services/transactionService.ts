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
    console.log("[TransactionService] Initialized");
  }

  /**
   * Fetch transactions for NFTs
   * @param arweaveIds Array of Arweave IDs
   * @returns Promise resolving to the fetched transactions
   */
  async fetchNftTransactions(arweaveIds: string[], actor: ActorSubclass<_SERVICE>): Promise<Transaction[]> {
    console.log("[TransactionService] fetchNftTransactions: Starting for Arweave IDs:", arweaveIds);
    this.dispatch(setLoading(true));
    this.dispatch(setError(null));

    try {
      const state = this.getState() as RootState;
      const { selectedPrincipals } = state.library;
      console.log("[TransactionService] fetchNftTransactions: Selected principals:", selectedPrincipals);
      // Fetch transactions for the Arweave IDs
      let transactions = await fetchTransactionsForAlexandrian(arweaveIds);
      console.log("[TransactionService] fetchNftTransactions: Initial transactions from Arweave:", JSON.stringify(transactions.map(t => ({id: t.id, assetUrl: t.assetUrl}))));


      if (!transactions || transactions.length === 0) {
        console.warn("[TransactionService] fetchNftTransactions: No transactions found for the NFTs from Arweave.");
        // If no initial transactions are found from Arweave, it's a more fundamental issue.
        throw new Error("No transactions found for the NFTs");
      }

      const userAssetCanisterPrincipal = selectedPrincipals[0];
      console.log("[TransactionService] fetchNftTransactions: User asset canister principal:", userAssetCanisterPrincipal);
      if (userAssetCanisterPrincipal && userAssetCanisterPrincipal !== 'new') {
        try { // This outer try is for setup: getAssetCanister, getActorUserAssetCanister
          const userAssetCanisterId = await getAssetCanister(userAssetCanisterPrincipal, actor);
          console.log("[TransactionService] fetchNftTransactions: User asset canister ID:", userAssetCanisterId);

          if (userAssetCanisterId) {
            const assetActor = await getActorUserAssetCanister(userAssetCanisterId);
            console.log("[TransactionService] fetchNftTransactions: Asset actor created for canister:", userAssetCanisterId);
            
            // --- ISOLATED TRY/CATCH FOR "ContentData" ---
            try {
              console.log("[TransactionService] fetchNftTransactions: Attempting to fetch 'ContentData' from user asset canister:", userAssetCanisterId);
              const getContentData = await fetchAssetFromUserCanister(
                "ContentData",
                assetActor
              );

              if (getContentData?.blob) {
                console.log("[TransactionService] fetchNftTransactions: 'ContentData' found in user asset canister. Size:", getContentData.blob.size);
                // Optional: further processing of ContentData if it exists
                const blobData = await getContentData.blob.arrayBuffer();
                const textData = new TextDecoder().decode(blobData);
                const jsonData = JSON.parse(textData);
                console.log("[TransactionService] fetchNftTransactions: Parsed jsonData from 'ContentData':", jsonData);
              } else {
                // This 'else' branch means fetchAssetFromUserCanister returned null (e.g. no error but no data) or blob was missing
                console.warn(`[TransactionService] fetchNftTransactions: No "ContentData" blob found or fetch returned null for user asset canister: ${userAssetCanisterId}`);
              }
            } catch (contentDataError) {
              // This catch handles errors specifically from fetching/processing "ContentData"
              console.warn(`[TransactionService] fetchNftTransactions: Error fetching or processing 'ContentData' from user asset canister ${userAssetCanisterId}. This is non-fatal and proceeding to individual assets. Error:`, contentDataError);
            }
            // --- END OF ISOLATED TRY/CATCH FOR "ContentData" ---

            // Now, always attempt to fetch individual assets regardless of "ContentData" outcome
            console.log("[TransactionService] fetchNftTransactions: Attempting to fetch individual assets from user canister for", transactions.length, "transactions.");
            const assetFetchPromises = transactions.map(async (transaction) => {
              console.log(`[TransactionService] fetchNftTransactions: Processing transaction ID: ${transaction.id}`);
              try {
                const assetKeyInCanister = `/arweave/${transaction.id}`; // Use prefixed key
                console.log(`[TransactionService] fetchNftTransactions: Constructed asset key for canister: ${assetKeyInCanister}`);
                
                console.log(`[TransactionService] fetchNftTransactions: Calling fetchAssetFromUserCanister for key: ${assetKeyInCanister}`);
                const result = await fetchAssetFromUserCanister(
                  assetKeyInCanister, // Use the correctly formatted key
                  assetActor
                );

                if (result?.blob) {
                  const assetUrl = URL.createObjectURL(result.blob);
                  console.log(`[TransactionService] fetchNftTransactions: Asset found in canister for key ${assetKeyInCanister}. Blob size: ${result.blob.size}. Generated assetUrl: ${assetUrl}`);
                  return { ...transaction, assetUrl }; // Return a new transaction object with the URL
                } else {
                  console.log(`[TransactionService] fetchNftTransactions: Asset NOT found in canister for key ${assetKeyInCanister}. Original assetUrl: ${transaction.assetUrl}`);
                  return transaction; // Return original transaction if not found in user canister
                }
              } catch (individualAssetError) {
                const errorMessage = individualAssetError instanceof Error && individualAssetError.message.includes("asset not found") ? individualAssetError.message : String(individualAssetError);
                console.warn(
                  `[TransactionService] fetchNftTransactions: Failed to fetch individual asset ${transaction.id} (key: /arweave/${transaction.id}) from user canister ${userAssetCanisterId}: ${errorMessage}. This is non-fatal for this specific asset.`
                );
                return transaction; // Return original transaction for this specific asset
              }
            });
            
            transactions = await Promise.all(assetFetchPromises);
            console.log("[TransactionService] fetchNftTransactions: Transactions after attempting fetch from user asset canister (Promise.all resolved):", JSON.stringify(transactions.map(t => ({id: t.id, assetUrl: t.assetUrl}))));
          } else {
            console.warn("[TransactionService] fetchNftTransactions: No userAssetCanisterId found. Skipping asset canister check.");
          }
        } catch (setupError) { // This catch is for setup errors (getAssetCanister, getActorUserAssetCanister)
          console.error("[TransactionService] fetchNftTransactions: Error during asset canister setup (e.g., getting canister ID or actor). Proceeding with Arweave fallback for all assets.", setupError);
          // If setup fails, we can't proceed with individual fetches, so Arweave fallback is appropriate here.
        }
      } else {
        console.log("[TransactionService] fetchNftTransactions: No userAssetCanisterPrincipal or principal is 'new'. Skipping asset canister check.");
      }

      // Store the transactions (potentially updated with URLs from user asset canister)
      console.log("[TransactionService] fetchNftTransactions: Dispatching setTransactions with:", JSON.stringify(transactions.map(t => ({id: t.id, assetUrl: t.assetUrl}))));
      this.dispatch(setTransactions(transactions));
      // Load content for each transaction (ContentService will use Arweave if assetUrl is not already set)
      console.log("[TransactionService] fetchNftTransactions: Calling loadContentForTransactions for", transactions.length, "transactions.");
      await this.loadContentForTransactions(transactions);
                 


      console.log("[TransactionService] fetchNftTransactions: Successfully completed. Returning transactions.");
      return transactions;
    } catch (error) {
      console.error("[TransactionService] fetchNftTransactions: Error in main try block:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      this.dispatch(setError(errorMessage));
      throw error;
    } finally {
      console.log("[TransactionService] fetchNftTransactions: Finalizing, setting loading to false.");
      this.dispatch(setLoading(false));
    }
  }

  /**
   * Fetch transactions for Permasearch
   * @param query Search query
   * @param owner Optional owner filter
   * @param cursor Optional pagination cursor
   * @param limit Optional results limit
   * @returns Promise resolving to the fetched transactions
   */
  async fetchPermasearchTransactions(
    query: string,
    owner?: string,
    cursor?: string,
    limit = 20
  ): Promise<Transaction[]> {
    this.dispatch(setLoading(true));

    try {
      // Use the existing fetchTransactions function
      const transactions = await this.fetchTransactionsForPermasearch(
        query,
        owner,
        cursor,
        limit
      );

      if (transactions && transactions.length > 0) {
        this.dispatch(setTransactions(transactions));

        // Load content for each transaction
        await this.loadContentForTransactions(transactions);
      }

      return transactions || [];
    } catch (error) {
      console.error("Error fetching Permasearch transactions:", error);
      this.dispatch(
        setError(error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  /**
   * Fetch transactions for Permasearch using the arweaveClient
   * @param query Search query to parse for content types
   * @param owner Optional owner filter
   * @param cursor Optional pagination cursor
   * @param limit Optional results limit
   * @returns Promise resolving to the fetched transactions
   */
  private async fetchTransactionsForPermasearch(
    query: string,
    owner?: string,
    cursor?: string,
    limit = 20
  ): Promise<Transaction[]> {
    // Parse the query to determine content types if needed
    const contentTypes = this.parseQueryForContentTypes(query);

    // Use the existing fetchTransactions function from arweaveClient
    return await fetchTransactions(
      undefined, // nftIds
      contentTypes, // contentTypes
      limit, // amount
      owner, // ownerFilter
      cursor, // after
      undefined, // minBlock
      undefined // maxBlock
    );
  }

  /**
   * Parse a query string to extract content types
   * This is a simplified implementation that should be adapted to your specific needs
   * @param query The search query
   * @returns Array of content types or undefined
   */
  private parseQueryForContentTypes(query: string): string[] | undefined {
    // This is a placeholder implementation
    // In a real implementation, you might parse the query string for specific content type indicators

    // For now, return undefined to let the backend decide
    return undefined;
  }

  /**
   * Load content for a set of transactions
   * @param transactions Transactions to load content for
   */
  async loadContentForTransactions(transactions: Transaction[]): Promise<void> {
    console.log(`[TransactionService] loadContentForTransactions: Starting for ${transactions.length} transactions.`);
    await Promise.all(
      transactions.map(async (transaction) => {
        console.log(`[TransactionService] loadContentForTransactions: Processing transaction ID: ${transaction.id}, assetUrl: ${transaction.assetUrl}`);
        try {
          const content = await ContentService.loadContent(transaction);
          console.log(`[TransactionService] loadContentForTransactions: ContentService.loadContent result for ${transaction.id}:`, content ? {url: content.url, error: content.error, textContent: content.textContent ? 'exists' : null} : null);
          const urls = await ContentService.getContentUrls(
            transaction,
            content
          );
          console.log(`[TransactionService] loadContentForTransactions: ContentService.getContentUrls result for ${transaction.id}:`, urls);

          this.dispatch(
            setContentData({
              id: transaction.id,
              content: {
                ...content,
                urls,
              },
            })
          );
          console.log(`[TransactionService] loadContentForTransactions: Dispatched setContentData for ${transaction.id}`);
        } catch (error) {
          console.error(
            `[TransactionService] loadContentForTransactions: Error loading content for transaction ${transaction.id}:`,
            error
          );
        }
      })
    );
    console.log(`[TransactionService] loadContentForTransactions: Completed for ${transactions.length} transactions.`);
  }

  /**
   * Clear all transactions and content data
   */
  clearAll(): void {
    console.log("[TransactionService] clearAll: Clearing transactions and content data.");
    this.dispatch(clearTransactions());
    this.dispatch(clearContentData());
  }

  /**
   * Add a single transaction
   * @param transaction Transaction to add
   */
  addTransaction(transaction: Transaction): void {
    console.log("[TransactionService] addTransaction: Adding transaction:", transaction.id);
    this.dispatch(addTransactionAction(transaction));
  }

  /**
   * Remove a transaction by ID
   * @param id Transaction ID to remove
   */
  removeTransaction(id: string): void {
    console.log("[TransactionService] removeTransaction: Removing transaction:", id);
    this.dispatch(removeTransactionAction(id));
  }

  
}

// Singleton instance
let transactionServiceInstance: TransactionService | null = null;

/**
 * Get the transaction service instance
 * @param dispatch Redux dispatch function
 * @param getState Redux getState function
 * @returns TransactionService instance
 */
export const getTransactionService = (
  dispatch: AppDispatch,
  getState: () => RootState
): TransactionService => {
  // console.log("[TransactionService] getTransactionService: Called. Instance exists:", !!transactionServiceInstance); // This can be too noisy
  if (!transactionServiceInstance) {
    transactionServiceInstance = new TransactionService(dispatch, getState);
    console.log("[TransactionService] getTransactionService: New instance created.");
  }
  return transactionServiceInstance;
};
