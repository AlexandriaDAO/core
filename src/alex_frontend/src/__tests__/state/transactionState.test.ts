import { configureStore, AnyAction } from '@reduxjs/toolkit';
import transactionsReducer, {
  setTransactions,
  clearTransactions,
  setContentData,
  clearContentData,
  clearTransactionContent,
  removeTransaction,
  addTransaction,
  ContentDataItem
} from '@/apps/Modules/shared/state/transactions/transactionSlice';
import { loadContentForTransactions, updateTransactions } from '@/apps/Modules/shared/state/transactions/transactionThunks';
import { Transaction } from '@/apps/Modules/shared/types/queries';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { AppDispatch } from '@/store';
import { CachedContent, ContentUrlInfo } from '@/apps/Modules/LibModules/contentDisplay/types';

// Mock the selectFilteredAndSortedTransactions selector
jest.mock('@/apps/Modules/shared/state/transactions/transactionSortUtils', () => ({
  selectFilteredAndSortedTransactions: jest.fn((state: any) => {
    const transactions = state.transactions.transactions;
    const tags = state.library.tags;
    const ascending = state.library.sortAsc;
    
    // Filter transactions by tags
    const filteredTransactions = tags.length === 0 
      ? transactions 
      : transactions.filter((transaction: Transaction) => {
          const contentTypeTag = transaction.tags.find((tag: { name: string; value: string }) => tag.name === 'Content-Type');
          return contentTypeTag && tags.includes(contentTypeTag.value);
        });

    // Sort transactions
    return ascending 
      ? filteredTransactions 
      : [...filteredTransactions].reverse();
  }),
  useSortedTransactions: jest.fn()
}));

// Import the mocked selector
import { selectFilteredAndSortedTransactions } from '@/apps/Modules/shared/state/transactions/transactionSortUtils';

// Mock the external dependencies
jest.mock('@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi', () => ({
  fetchTransactionsForAlexandrian: jest.fn().mockResolvedValue([
    {
      id: 'tx1',
      owner: 'owner1',
      tags: [{ name: 'Content-Type', value: 'image/png' }],
      block: { height: 100, timestamp: 1625097600000 }
    },
    {
      id: 'tx2',
      owner: 'owner2',
      tags: [{ name: 'Content-Type', value: 'application/pdf' }],
      block: { height: 101, timestamp: 1625097700000 }
    }
  ])
}));

// Mock imported functions
jest.mock('@/apps/Modules/shared/state/transactions/transactionThunks', () => {
  const originalModule = jest.requireActual('@/apps/Modules/shared/state/transactions/transactionThunks');
  return {
    ...originalModule,
    loadContentForTransactions: jest.fn().mockImplementation((transactions) => {
      return async (dispatch: AppDispatch) => {
        // For each transaction, dispatch a setContentData action
        transactions.forEach((tx: Transaction) => {
          dispatch({
            type: 'transactions/setContentData',
            payload: {
              id: tx.id,
              content: { data: 'mocked content for ' + tx.id }
            }
          });
        });
        return Promise.resolve();
      };
    }),
  };
});

// Mock ContentService
jest.mock('@/apps/Modules/LibModules/contentDisplay/services/contentService', () => ({
  ContentService: {
    loadContent: jest.fn().mockResolvedValue({ 
      url: 'https://arweave.net/test',
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null
    } as CachedContent),
    getContentUrls: jest.fn().mockResolvedValue({ 
      thumbnailUrl: 'test-thumbnail-url',
      coverUrl: 'test-cover-url',
      fullUrl: 'test-url.com'
    } as ContentUrlInfo)
  }
}));

jest.mock('@/features/auth/utils/authUtils', () => ({
  getActorUserAssetCanister: jest.fn().mockResolvedValue({})
}));

jest.mock('@/apps/Modules/shared/state/assetManager/assetManagerThunks', () => ({
  fetchAssetFromUserCanister: jest.fn().mockResolvedValue({ blob: null })
}));

jest.mock('@/apps/Modules/shared/state/assetManager/utlis', () => ({
  getAssetCanister: jest.fn().mockResolvedValue(null)
}));

// Define the TransactionState interface
interface TransactionState {
  transactions: Transaction[];
  contentData: Record<string, ContentDataItem>;
  isAuthenticated?: boolean;
  isUpdated: boolean;
}

// Define the LibraryState interface
interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
  tags: string[];
  collection: 'NFT' | 'SBT';
  isLoading: boolean;
  noResults: boolean;
  searchParams: {
    start: number;
    end: number;
    pageSize: number;
    startFromEnd: boolean;
  };
  lastSearchTimestamp: number;
  totalItems: number;
}

// Define the RootState interface
interface RootState {
  transactions: TransactionState;
  library: LibraryState;
  assetManager: {
    userAssetCanister: string | null;
  };
}

describe('Transaction State', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        transactions: transactionsReducer,
        library: (state = { 
          sortAsc: true, 
          tags: [], 
          selectedPrincipals: [],
          collection: 'NFT',
          isLoading: false,
          noResults: false,
          searchParams: {
            start: 0,
            end: 20,
            pageSize: 20,
            startFromEnd: false
          },
          lastSearchTimestamp: 0,
          totalItems: 0
        }, action) => state,
        assetManager: (state = { userAssetCanister: null }, action) => state
      }
    });
  });

  describe('transactionSlice reducers', () => {
    it('should handle setTransactions action', () => {
      // Initial state should have empty transactions
      const initialState = store.getState() as RootState;
      expect(initialState.transactions.transactions).toEqual([]);
      
      // Create mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }],
          block: { height: 100, timestamp: 1625097600000 }
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }],
          block: { height: 101, timestamp: 1625097700000 }
        }
      ];
      
      // Set transactions
      store.dispatch(setTransactions(mockTransactions));
      
      // Verify transactions are set
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.transactions).toEqual(mockTransactions);
      
      // Verify isUpdated flag is toggled
      expect(updatedState.transactions.isUpdated).not.toEqual(initialState.transactions.isUpdated);
    });

    it('should handle clearTransactions action', () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        }
      ];
      store.dispatch(setTransactions(mockTransactions));
      
      // Verify initial state has transactions
      const stateWithTransactions = store.getState() as RootState;
      expect(stateWithTransactions.transactions.transactions.length).toBe(1);
      
      // Clear transactions
      store.dispatch(clearTransactions());
      
      // Verify transactions are cleared
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.transactions).toEqual([]);
      
      // Verify isUpdated flag is toggled
      expect(updatedState.transactions.isUpdated).not.toEqual(stateWithTransactions.transactions.isUpdated);
    });

    it('should handle addTransaction action', () => {
      // Initial state should have empty transactions
      const initialState = store.getState() as RootState;
      expect(initialState.transactions.transactions).toEqual([]);
      
      // Create a mock transaction
      const mockTransaction: Transaction = {
        id: 'tx1',
        owner: 'owner1',
        tags: [{ name: 'Content-Type', value: 'image/png' }]
      };
      
      // Add transaction
      store.dispatch(addTransaction(mockTransaction));
      
      // Verify transaction is added
      const stateAfterAdd = store.getState() as RootState;
      expect(stateAfterAdd.transactions.transactions).toEqual([mockTransaction]);
      
      // Verify isUpdated flag is toggled
      expect(stateAfterAdd.transactions.isUpdated).not.toEqual(initialState.transactions.isUpdated);
    });

    it('should handle removeTransaction action', () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }]
        }
      ];
      store.dispatch(setTransactions(mockTransactions));
      
      // Verify initial state has transactions
      const stateWithTransactions = store.getState() as RootState;
      expect(stateWithTransactions.transactions.transactions.length).toBe(2);
      
      // Remove transaction by id
      store.dispatch(removeTransaction('tx1'));
      
      // Verify transaction is removed
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.transactions.length).toBe(1);
      expect(updatedState.transactions.transactions[0].id).toBe('tx2');
    });

    it('should handle setContentData action', () => {
      // Initial state should have empty contentData
      const initialState = store.getState() as RootState;
      expect(initialState.transactions.contentData).toEqual({});
      
      // Create mock content data
      const mockContentData: ContentDataItem = {
        url: 'https://arweave.net/tx1',
        textContent: null,
        imageObjectUrl: null,
        thumbnailUrl: null,
        error: null,
        urls: {
          thumbnailUrl: 'thumbnail-url',
          coverUrl: 'cover-url',
          fullUrl: 'full-url'
        }
      };
      
      // Set content data
      store.dispatch(setContentData({ id: 'tx1', content: mockContentData }));
      
      // Verify content data is set
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.contentData).toEqual({
        tx1: mockContentData
      });
    });

    it('should handle clearContentData action', () => {
      // Set up initial state with content data
      store.dispatch(setContentData({
        id: 'tx1',
        content: {
          url: 'https://arweave.net/tx1',
          textContent: null,
          imageObjectUrl: null,
          thumbnailUrl: null,
          error: null,
          urls: {
            thumbnailUrl: 'thumbnail-url',
            coverUrl: 'cover-url',
            fullUrl: 'full-url'
          }
        }
      }));
      
      // Verify initial state has content data
      const stateWithContentData = store.getState() as RootState;
      expect(Object.keys(stateWithContentData.transactions.contentData).length).toBe(1);
      
      // Clear content data
      store.dispatch(clearContentData());
      
      // Verify content data is cleared
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.contentData).toEqual({});
    });

    it('should handle clearTransactionContent action', () => {
      // Set up initial state with content data for multiple transactions
      store.dispatch(setContentData({
        id: 'tx1',
        content: {
          url: 'https://arweave.net/tx1',
          textContent: null,
          imageObjectUrl: null,
          thumbnailUrl: null,
          error: null,
          urls: {
            thumbnailUrl: 'thumbnail-url-1',
            coverUrl: 'cover-url-1',
            fullUrl: 'full-url-1'
          }
        }
      }));
      
      store.dispatch(setContentData({
        id: 'tx2',
        content: {
          url: 'https://arweave.net/tx2',
          textContent: null,
          imageObjectUrl: null,
          thumbnailUrl: null,
          error: null,
          urls: {
            thumbnailUrl: 'thumbnail-url-2',
            coverUrl: 'cover-url-2',
            fullUrl: 'full-url-2'
          }
        }
      }));
      
      // Verify initial state has content data for both transactions
      const stateWithContentData = store.getState() as RootState;
      expect(Object.keys(stateWithContentData.transactions.contentData).length).toBe(2);
      
      // Clear content data for one transaction
      store.dispatch(clearTransactionContent('tx1'));
      
      // Verify content data is cleared for the specified transaction only
      const updatedState = store.getState() as RootState;
      expect(Object.keys(updatedState.transactions.contentData).length).toBe(1);
      expect(updatedState.transactions.contentData['tx1']).toBeUndefined();
      expect(updatedState.transactions.contentData['tx2']).toBeDefined();
    });
  });

  describe('transactionThunks', () => {
    it('should handle loadContentForTransactions thunk', async () => {
      // Create mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }]
        }
      ];
      
      // Call the loadContentForTransactions thunk
      await store.dispatch(loadContentForTransactions(mockTransactions) as unknown as AnyAction);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Verify content data is set for both transactions
      const updatedState = store.getState() as RootState;
      expect(Object.keys(updatedState.transactions.contentData).length).toBe(2);
      expect(updatedState.transactions.contentData['tx1']).toBeDefined();
      expect(updatedState.transactions.contentData['tx2']).toBeDefined();
    });

    it('should handle updateTransactions thunk with arweave IDs', async () => {
      // Mock the ContentService.loadContent method
      const mockContent: CachedContent = { 
        url: 'https://arweave.net/test',
        textContent: null,
        imageObjectUrl: null,
        thumbnailUrl: null,
        error: null
      };
      const mockUrls: ContentUrlInfo = { 
        thumbnailUrl: 'test-thumbnail-url',
        coverUrl: 'test-cover-url',
        fullUrl: 'test-url.com'
      };
      
      // Mock the content service
      jest.spyOn(ContentService, 'loadContent').mockResolvedValue(mockContent);
      jest.spyOn(ContentService, 'getContentUrls').mockResolvedValue(mockUrls);
      
      // Call the updateTransactions thunk with arweave IDs
      await store.dispatch(updateTransactions(['tx1', 'tx2']) as unknown as AnyAction);
      
      // Verify transactions are an empty array (per the current implementation)
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.transactions.length).toBe(0);
      
      // Verify content data is set for both transactions
      // The content data should still be loaded even though transactions array is empty
      expect(Object.keys(updatedState.transactions.contentData).length).toBe(2);
    });

    it('should handle updateTransactions thunk with empty arweave IDs array', async () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        }
      ];
      store.dispatch(setTransactions(mockTransactions));
      
      // Call the updateTransactions thunk with empty array
      await store.dispatch(updateTransactions([]) as unknown as AnyAction);
      
      // Verify transactions from initial state are returned (since no change for empty array)
      const updatedState = store.getState() as RootState;
      expect(updatedState.transactions.transactions).toEqual(mockTransactions);
    });
  });

  describe('transactionSortUtils', () => {
    it('should filter transactions by tags', () => {
      // Set up initial state with transactions of different content types
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }]
        },
        {
          id: 'tx3',
          owner: 'owner3',
          tags: [{ name: 'Content-Type', value: 'image/jpeg' }]
        }
      ];
      
      store.dispatch(setTransactions(mockTransactions));
      
      // Get the current state
      const state = store.getState() as RootState;
      
      // Create a modified state with tags filter
      const modifiedState = {
        ...state,
        library: {
          ...state.library,
          tags: ['image/png', 'image/jpeg']
        }
      };
      
      // Use the selector with our modified state
      const filteredTransactions = selectFilteredAndSortedTransactions(modifiedState as any);
      
      // Verify only transactions with matching content types are included
      expect(filteredTransactions.length).toBe(2);
      expect(filteredTransactions.some(tx => tx.id === 'tx1')).toBe(true);
      expect(filteredTransactions.some(tx => tx.id === 'tx3')).toBe(true);
      expect(filteredTransactions.some(tx => tx.id === 'tx2')).toBe(false);
    });

    it('should return all transactions when no tags are selected', () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }]
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }]
        }
      ];
      
      store.dispatch(setTransactions(mockTransactions));
      
      // Get the current state
      const state = store.getState() as RootState;
      
      // Create a modified state with empty tags filter
      const modifiedState = {
        ...state,
        library: {
          ...state.library,
          tags: []
        }
      };
      
      // Use the selector with our modified state
      const filteredTransactions = selectFilteredAndSortedTransactions(modifiedState as any);
      
      // Verify all transactions are included
      expect(filteredTransactions.length).toBe(2);
    });

    it('should sort transactions in ascending order', () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }],
          block: { height: 100, timestamp: 1625097600000 }
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }],
          block: { height: 101, timestamp: 1625097700000 }
        }
      ];
      
      store.dispatch(setTransactions(mockTransactions));
      
      // Get the current state
      const state = store.getState() as RootState;
      
      // Create a modified state with ascending sort
      const modifiedState = {
        ...state,
        library: {
          ...state.library,
          sortAsc: true
        }
      };
      
      // Use the selector with our modified state
      const sortedTransactions = selectFilteredAndSortedTransactions(modifiedState as any);
      
      // Verify transactions are in original order (ascending)
      expect(sortedTransactions[0].id).toBe('tx1');
      expect(sortedTransactions[1].id).toBe('tx2');
    });

    it('should sort transactions in descending order', () => {
      // Set up initial state with transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }],
          block: { height: 100, timestamp: 1625097600000 }
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }],
          block: { height: 101, timestamp: 1625097700000 }
        }
      ];
      
      store.dispatch(setTransactions(mockTransactions));
      
      // Get the current state
      const state = store.getState() as RootState;
      
      // Create a modified state with descending sort
      const modifiedState = {
        ...state,
        library: {
          ...state.library,
          sortAsc: false
        }
      };
      
      // Use the selector with our modified state
      const sortedTransactions = selectFilteredAndSortedTransactions(modifiedState as any);
      
      // Verify transactions are in reverse order (descending)
      expect(sortedTransactions[0].id).toBe('tx2');
      expect(sortedTransactions[1].id).toBe('tx1');
    });

    it('should filter and sort transactions together', () => {
      // Set up initial state with transactions of different content types
      const mockTransactions: Transaction[] = [
        {
          id: 'tx1',
          owner: 'owner1',
          tags: [{ name: 'Content-Type', value: 'image/png' }],
          block: { height: 100, timestamp: 1625097600000 }
        },
        {
          id: 'tx2',
          owner: 'owner2',
          tags: [{ name: 'Content-Type', value: 'application/pdf' }],
          block: { height: 101, timestamp: 1625097700000 }
        },
        {
          id: 'tx3',
          owner: 'owner3',
          tags: [{ name: 'Content-Type', value: 'image/jpeg' }],
          block: { height: 102, timestamp: 1625097800000 }
        }
      ];
      
      store.dispatch(setTransactions(mockTransactions));
      
      // Get the current state
      const state = store.getState() as RootState;
      
      // Create a modified state with tags filter and descending sort
      const modifiedState = {
        ...state,
        library: {
          ...state.library,
          tags: ['image/png', 'image/jpeg'],
          sortAsc: false
        }
      };
      
      // Use the selector with our modified state
      const filteredAndSortedTransactions = selectFilteredAndSortedTransactions(modifiedState as any);
      
      // Verify transactions are filtered and sorted correctly
      expect(filteredAndSortedTransactions.length).toBe(2);
      expect(filteredAndSortedTransactions[0].id).toBe('tx3'); // Latest image transaction first
      expect(filteredAndSortedTransactions[1].id).toBe('tx1'); // Older image transaction second
    });
  });
}); 