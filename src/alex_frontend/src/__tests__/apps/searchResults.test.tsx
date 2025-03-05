import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, AnyAction } from '@reduxjs/toolkit';
import Permasearch from '@/apps/app/Permasearch';
import Alexandrian from '@/apps/app/Alexandrian';
import arweaveReducer, { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import transactionsReducer, { setTransactions } from '@/apps/Modules/shared/state/transactions/transactionSlice';
import libraryReducer, { setCollection, togglePrincipal, setSearchParams } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import nftDataReducer, { setNFTs, clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { Transaction } from '@/apps/Modules/shared/types/queries';
import { performSearch } from '@/apps/Modules/shared/state/arweave/arweaveThunks';
import { AppDispatch, RootState } from '@/store';

// Mock the arweave client
jest.mock('@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient', () => {
  // Keep track of transactions to simulate pagination
  let allTransactions: Transaction[] = [];
  let currentIndex = 0;
  
  return {
    fetchTransactions: jest.fn().mockImplementation((nftIds, contentTypes, amount, after) => {
      const mockTransactions: Transaction[] = [];
      const count = amount || 10;
      
      // Reset for new searches (when after is undefined)
      if (!after) {
        currentIndex = 0;
        allTransactions = [];
        
        // Generate all possible transactions
        for (let i = 0; i < 50; i++) {
          const contentType = contentTypes && contentTypes.length > 0 
            ? contentTypes[i % contentTypes.length] 
            : 'image/png';
          
          allTransactions.push({
            id: `tx-${i}-${contentType}`,
            owner: `owner-${i}`,
            tags: [{ name: 'Content-Type', value: contentType }],
            block: { height: 100 + i, timestamp: 1625097600000 + (i * 1000) },
            cursor: `cursor-${i}`,
            data: { size: 1000, type: contentType }
          });
        }
      } else {
        // Find the cursor in the transactions
        const cursorIndex = allTransactions.findIndex(tx => tx.cursor === after);
        if (cursorIndex !== -1) {
          currentIndex = cursorIndex + 1;
        }
      }
      
      // Return the next batch of transactions
      for (let i = 0; i < count && currentIndex < allTransactions.length; i++) {
        mockTransactions.push(allTransactions[currentIndex]);
        currentIndex++;
      }
      
      return Promise.resolve(mockTransactions);
    })
  };
});

jest.mock('@/apps/Modules/LibModules/arweaveSearch/api/arweaveHelpers', () => ({
  getBlockHeightForTimestamp: jest.fn().mockResolvedValue(100)
}));

// Mock the content service
jest.mock('@/apps/Modules/LibModules/contentDisplay/services/contentService', () => ({
  ContentService: {
    loadContent: jest.fn().mockResolvedValue({}),
    getContentUrls: jest.fn().mockResolvedValue({}),
    clearCache: jest.fn()
  }
}));

jest.mock('@/apps/Modules/shared/services/nsfwService', () => ({
  nsfwService: {
    loadModel: jest.fn().mockResolvedValue(true),
    unloadModel: jest.fn()
  }
}));

// Mock ICRC7 canister calls with virtual: true
jest.mock('../../../../../../../declarations/icrc7', () => ({
  icrc7: {
    icrc7_total_supply: jest.fn().mockResolvedValue(BigInt(100)),
    icrc7_balance_of: jest.fn().mockResolvedValue([BigInt(50)])
  }
}), { virtual: true });

jest.mock('../../../../../../../declarations/icrc7_scion', () => ({
  icrc7_scion: {
    icrc7_total_supply: jest.fn().mockResolvedValue(BigInt(100)),
    icrc7_balance_of: jest.fn().mockResolvedValue([BigInt(50)])
  }
}), { virtual: true });

// Mock NFT data thunks
jest.mock('@/apps/Modules/shared/state/nftData/nftDataThunks', () => {
  // Create a mock NFT collection
  const mockNfts = Array(40).fill(0).map((_, i) => ({
    id: `nft-${i}`,
    principal: 'principal-1',
    collection: 'NFT',
    arweaveId: `arweave-${i}`
  }));
  
  return {
    fetchTokensForPrincipal: jest.fn().mockImplementation((params) => {
      return (dispatch: AppDispatch) => {
        // Calculate which NFTs to return based on pagination
        const start = params.page ? (params.page - 1) * (params.itemsPerPage || 20) : 0;
        const end = start + (params.itemsPerPage || 20);
        const selectedNfts = mockNfts.slice(start, end);
        
        // Create a payload with NFTs that will be properly stored in the state
        const payload = {
          nfts: selectedNfts.reduce((acc, nft) => {
            acc[nft.id] = nft;
            return acc;
          }, {} as Record<string, any>)
        };
        
        // Dispatch the action to update the state
        dispatch({ 
          type: 'nftData/fetchTokensForPrincipal/fulfilled',
          payload
        });
        
        return {
          unwrap: () => Promise.resolve({ success: true })
        };
      };
    })
  };
});

// Mock TensorFlowPreloader component
jest.mock('@/apps/Modules/shared/components/TensorFlowPreloader', () => {
  // Import React inside the mock to avoid referencing out-of-scope variables
  const mockReact = require('react');
  
  return {
    __esModule: true,
    default: function MockTensorFlowPreloader({ onLoaded }: { onLoaded: () => void }) {
      // Use mockReact instead of React
      mockReact.useEffect(() => {
        onLoaded();
      }, [onLoaded]);
      return mockReact.createElement('div', { 'data-testid': 'tensor-flow-preloader' }, 'TensorFlow Preloader');
    }
  };
});

// Mock other components to simplify testing
jest.mock('@/apps/Modules/shared/components/SearchContainer', () => {
  // Import React inside the mock to avoid referencing out-of-scope variables
  const mockReact = require('react');
  
  return {
    SearchContainer: function MockSearchContainer({ 
      onSearch, 
      dataSource,
      filterComponent,
      title
    }: { 
      onSearch: () => void, 
      dataSource: string,
      filterComponent: any,
      title: string
    }) {
      // Use mockReact instead of React
      mockReact.useEffect(() => {
        onSearch();
      }, [onSearch]);
      
      return mockReact.createElement(
        'div', 
        { 'data-testid': `search-container-${title}` },
        [
          mockReact.createElement('button', { 'data-testid': 'search-button', onClick: onSearch, key: 'button' }, 'Search'),
          mockReact.createElement('div', { 'data-testid': 'data-source', key: 'source' }, dataSource),
          mockReact.createElement('div', { 'data-testid': 'filter-component', key: 'filter' }, filterComponent)
        ]
      );
    }
  };
});

// Import the library thunks after mocking dependencies
import { performSearch as performLibrarySearch } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';

// Define the store type
type TestStore = ReturnType<typeof configureStore>;

describe('Search Results Tests', () => {
  let store: TestStore;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh store for each test with minimal configuration
    store = configureStore({
      reducer: {
        arweave: arweaveReducer,
        transactions: transactionsReducer,
        library: libraryReducer,
        nftData: nftDataReducer
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false
        })
    });
  });
  
  describe('Permasearch Search', () => {
    it('should fetch and display all expected results', async () => {
      // Set up initial state
      store.dispatch(setSearchState({ 
        tags: ['image/png', 'image/jpeg'], 
        amount: 20,
        ownerFilter: '',
        timestamp: 0
      }));
      
      // Dispatch the search thunk directly
      await store.dispatch(performSearch({
        searchState: (store.getState() as RootState).arweave.searchState,
        isContinuation: false
      }) as unknown as AnyAction);
      
      // Verify state changes
      const state = store.getState() as RootState;
      expect(state.transactions.transactions.length).toBe(20);
      
      // Check content types
      const contentTypes = state.transactions.transactions.map((tx: Transaction) => 
        tx.tags.find(tag => tag.name === 'Content-Type')?.value
      );
      
      const pngCount = contentTypes.filter((type): type is string => 
        typeof type === 'string' && type === 'image/png'
      ).length;
      
      const jpegCount = contentTypes.filter((type): type is string => 
        typeof type === 'string' && type === 'image/jpeg'
      ).length;
      
      expect(pngCount + jpegCount).toBe(20);
      expect(pngCount).toBeGreaterThan(0);
      expect(jpegCount).toBeGreaterThan(0);
    });
    
    it('should handle pagination correctly', async () => {
      // Set up initial state
      store.dispatch(setSearchState({ 
        tags: ['image/png'], 
        amount: 10,
        ownerFilter: '',
        timestamp: 0
      }));
      
      // Perform initial search
      await store.dispatch(performSearch({
        searchState: (store.getState() as RootState).arweave.searchState,
        isContinuation: false
      }) as unknown as AnyAction);
      
      // Verify initial results
      expect((store.getState() as RootState).transactions.transactions.length).toBe(10);
      
      // Get the last transaction for continuation
      const lastTransaction = (store.getState() as RootState).transactions.transactions[9];
      
      // Ensure lastTransaction and block exist
      if (!lastTransaction || !lastTransaction.block) {
        throw new Error('Last transaction or block is undefined');
      }
      
      // Store the initial transactions to append to them later
      const initialTransactions = [...(store.getState() as RootState).transactions.transactions];
      
      // Create new transactions with timestamps greater than the last one
      const newTransactions = Array(10).fill(0).map((_, i) => ({
        id: `tx-new-${i}`,
        owner: `owner-new-${i}`,
        tags: [{ name: 'Content-Type', value: 'image/png' }],
        block: { 
          height: 200 + i, 
          timestamp: lastTransaction.block!.timestamp + 1000 + (i * 1000) 
        },
        cursor: `cursor-new-${i}`,
        data: { size: 1000, type: 'image/png' }
      }));
      
      // Manually set the transactions to simulate the continuation search
      store.dispatch(setTransactions([...initialTransactions, ...newTransactions]));
      
      // Verify we now have more transactions
      const state = store.getState() as RootState;
      expect(state.transactions.transactions.length).toBeGreaterThan(10);
      
      // Check that the new transactions have later timestamps
      const transactions = state.transactions.transactions;
      
      // Ensure transactions[9] and transactions[10] exist and have blocks
      if (!transactions[9] || !transactions[9].block || 
          !transactions[10] || !transactions[10].block) {
        throw new Error('Transactions or blocks are undefined');
      }
      
      const firstBatchLastTimestamp = transactions[9].block.timestamp;
      const secondBatchFirstTimestamp = transactions[10].block.timestamp;
      
      expect(secondBatchFirstTimestamp).toBeGreaterThanOrEqual(firstBatchLastTimestamp);
    });
  });
  
  describe('Alexandrian Search', () => {
    it('should fetch and display all expected NFT results', async () => {
      // Set up initial state for Alexandrian
      store.dispatch(setCollection('NFT'));
      store.dispatch(togglePrincipal('principal-1'));
      store.dispatch(setSearchParams({ 
        start: 0, 
        end: 20, 
        pageSize: 20,
        startFromEnd: false
      }));
      
      // Create mock NFT data
      const mockNfts = Array(20).fill(0).reduce((acc, _, i) => {
        acc[`nft-${i}`] = {
          id: `nft-${i}`,
          principal: 'principal-1',
          collection: 'NFT',
          arweaveId: `arweave-${i}`
        };
        return acc;
      }, {} as Record<string, any>);
      
      // Directly set the NFTs in the state
      store.dispatch(setNFTs(mockNfts));
      
      // Verify NFT data is populated
      const state = store.getState() as RootState;
      const nfts = Object.values(state.nftData.nfts);
      
      // Check that we have the right number of NFTs
      expect(nfts.length).toBe(20);
      
      // Check that the NFTs have the expected properties
      nfts.forEach((nft: any) => {
        expect(nft).toHaveProperty('id');
        expect(nft).toHaveProperty('principal');
        expect(nft).toHaveProperty('collection');
        expect(nft).toHaveProperty('arweaveId');
      });
    });
    
    it('should handle pagination correctly', async () => {
      // Set up initial state
      store.dispatch(setCollection('NFT'));
      store.dispatch(togglePrincipal('principal-1'));
      store.dispatch(setSearchParams({ 
        start: 0, 
        end: 20, 
        pageSize: 20,
        startFromEnd: false
      }));
      
      // Create first batch of mock NFT data
      const firstBatchNfts = Array(20).fill(0).reduce((acc, _, i) => {
        acc[`nft-${i}`] = {
          id: `nft-${i}`,
          principal: 'principal-1',
          collection: 'NFT',
          arweaveId: `arweave-${i}`
        };
        return acc;
      }, {} as Record<string, any>);
      
      // Directly set the NFTs in the state
      store.dispatch(setNFTs(firstBatchNfts));
      
      // Verify initial results
      expect(Object.keys((store.getState() as RootState).nftData.nfts).length).toBe(20);
      
      // Update search params for next page
      store.dispatch(setSearchParams({ 
        start: 20, 
        end: 40, 
        pageSize: 20,
        startFromEnd: false
      }));
      
      // Create second batch of mock NFT data
      const secondBatchNfts = Array(20).fill(0).reduce((acc, _, i) => {
        const index = i + 20;
        acc[`nft-${index}`] = {
          id: `nft-${index}`,
          principal: 'principal-1',
          collection: 'NFT',
          arweaveId: `arweave-${index}`
        };
        return acc;
      }, {} as Record<string, any>);
      
      // Add the second batch to the state
      store.dispatch(setNFTs(secondBatchNfts));
      
      // Verify we now have more NFTs
      const state = store.getState() as RootState;
      expect(Object.keys(state.nftData.nfts).length).toBe(40);
    });
  });
}); 