/**
 * Unified transaction service that handles all transaction-related operations
 * for both general content and NFT-specific use cases.
 */
import { AppDispatch } from '@/store';
import { RootState } from '@/store';
import { fetchTransactionsForAlexandrian } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi';
import { fetchTransactions } from '@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Transaction } from '../../shared/types/queries';
import { CachedContent, ContentUrlInfo } from '../../LibModules/contentDisplay/types';
import { 
  setTransactions,
  addTransaction as addTransactionAction,
  removeTransaction as removeTransactionAction,
  clearTransactions,
  clearContentData,
  setContentData,
  setLoading,
  setError
} from '../state/transactions/transactionSlice';

export class TransactionService {
  private dispatch: AppDispatch;
  private getState: () => RootState;
  
  constructor(dispatch: AppDispatch, getState: () => RootState) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  /**
   * Fetch transactions for NFTs
   * @param arweaveIds Array of Arweave IDs
   * @returns Promise resolving to the fetched transactions
   */
  async fetchNftTransactions(arweaveIds: string[]): Promise<Transaction[]> {
    this.dispatch(setLoading(true));
    this.dispatch(setError(null));
    
    try {
      // Fetch transactions for the Arweave IDs
      const transactions = await fetchTransactionsForAlexandrian(arweaveIds);
      
      if (!transactions || transactions.length === 0) {
        console.warn('No transactions found for the NFTs');
        throw new Error('No transactions found for the NFTs');
      }
      
      // Store the transactions
      this.dispatch(setTransactions(transactions));
      
      // Load content for each transaction
      await this.loadContentForTransactions(transactions);
      
      return transactions;
    } catch (error) {
      console.error('Error fetching NFT transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.dispatch(setError(errorMessage));
      throw error;
    } finally {
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
      const transactions = await this.fetchTransactionsForPermasearch(query, owner, cursor, limit);
      
      if (transactions && transactions.length > 0) {
        this.dispatch(setTransactions(transactions));
        
        // Load content for each transaction
        await this.loadContentForTransactions(transactions);
      }
      
      return transactions || [];
    } catch (error) {
      console.error('Error fetching Permasearch transactions:', error);
      this.dispatch(setError(error instanceof Error ? error.message : 'Unknown error'));
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
    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const content = await ContentService.loadContent(transaction);
          const urls = await ContentService.getContentUrls(transaction, content);
          
          this.dispatch(setContentData({
            id: transaction.id,
            content: {
              ...content,
              urls
            }
          }));
        } catch (error) {
          console.error(`Error loading content for transaction ${transaction.id}:`, error);
        }
      })
    );
  }
  
  /**
   * Clear all transactions and content data
   */
  clearAll(): void {
    this.dispatch(clearTransactions());
    this.dispatch(clearContentData());
  }
  
  /**
   * Add a single transaction
   * @param transaction Transaction to add
   */
  addTransaction(transaction: Transaction): void {
    this.dispatch(addTransactionAction(transaction));
  }
  
  /**
   * Remove a transaction by ID
   * @param id Transaction ID to remove
   */
  removeTransaction(id: string): void {
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
  if (!transactionServiceInstance) {
    transactionServiceInstance = new TransactionService(dispatch, getState);
  }
  return transactionServiceInstance;
}; 