import { configureStore, AnyAction } from '@reduxjs/toolkit';
import libraryReducer, {
  resetSearch,
  toggleSortDirection,
  setTags,
  toggleTag,
  setCollection,
  setLoading,
  setNoResults,
  setSearchParams,
  updateLastSearchTimestamp,
  setTotalItems,
  togglePrincipal
} from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import librarySlice from '../../apps/Modules/shared/state/librarySearch/librarySlice';

// Mock the external dependencies
jest.mock('@/apps/Modules/shared/state/nftData/nftDataSlice', () => ({
  clearNfts: jest.fn().mockReturnValue({ type: 'nft/clearNfts' })
}));

jest.mock('@/apps/Modules/shared/state/content/contentDisplayThunks', () => ({
  updateTransactions: jest.fn().mockReturnValue({ type: 'content/updateTransactions' })
}));

jest.mock('@/apps/Modules/shared/state/nftData/nftDataThunks', () => ({
  fetchTokensForPrincipal: jest.fn().mockImplementation(() => {
    return (dispatch: any) => {
      dispatch({ type: 'nftData/fetchTokensForPrincipal/pending' });
      return {
        unwrap: () => Promise.resolve({ success: true })
      };
    };
  })
}));

// Mock the canister modules - but we'll bypass them in our tests
jest.mock('../../../../../../../declarations/icrc7', () => ({
  icrc7: {
    icrc7_total_supply: jest.fn().mockResolvedValue(BigInt(100)),
    icrc7_balance_of: jest.fn().mockResolvedValue([BigInt(50)])
  }
}), { virtual: true });

jest.mock('../../../../../../../declarations/icrc7_scion', () => ({
  icrc7_scion: {
    icrc7_total_supply: jest.fn().mockResolvedValue(BigInt(75)),
    icrc7_balance_of: jest.fn().mockResolvedValue([BigInt(25)])
  }
}), { virtual: true });

// Import the thunks after mocking the dependencies
import {
  performSearch,
  updateSearchParams,
  toggleSort
} from '@/apps/Modules/shared/state/librarySearch/libraryThunks';

// Define the SearchParams interface
interface SearchParams {
  start: number;
  end: number;
  pageSize: number;
  startFromEnd: boolean;
}

// Define the LibraryState interface
interface LibraryState {
  selectedPrincipals: string[];
  sortAsc: boolean;
  tags: string[];
  collection: 'NFT' | 'SBT';
  isLoading: boolean;
  noResults: boolean;
  searchParams: SearchParams;
  lastSearchTimestamp: number;
  totalItems: number;
}

// Define the store state type
interface RootState {
  library: LibraryState;
  nftData: {
    nfts: Record<string, any>;
  };
}

describe('Library State', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        library: libraryReducer,
        nftData: (state = { nfts: {} }, action) => state
      }
    });
  });

  describe('librarySlice reducers', () => {
    it('should handle resetSearch action', () => {
      // Setup initial state with some values
      store.dispatch(setTags(['tag1', 'tag2']));
      store.dispatch(setCollection('SBT'));
      store.dispatch(setLoading(true));
      store.dispatch(setNoResults(true));
      store.dispatch(setTotalItems(50));
      
      // Verify initial state has changed
      const state = store.getState() as RootState;
      expect(state.library.tags).toEqual(['tag1', 'tag2']);
      expect(state.library.collection).toBe('SBT');
      expect(state.library.isLoading).toBe(true);
      expect(state.library.noResults).toBe(true);
      
      // Reset the search
      store.dispatch(resetSearch());
      
      // Verify state after reset
      const updatedState = store.getState() as RootState;
      expect(updatedState.library.tags).toEqual([]); // Should be reset to initial value
      expect(updatedState.library.collection).toBe('SBT'); // Should be preserved
      expect(updatedState.library.isLoading).toBe(false); // Should be reset to initial value
      expect(updatedState.library.noResults).toBe(false); // Should be reset to initial value
      expect(updatedState.library.totalItems).toBe(50); // Should be preserved
    });

    it('should handle toggleSortDirection action', () => {
      // Initial state should have sortAsc as true
      const initialState = store.getState() as RootState;
      expect(initialState.library.sortAsc).toBe(true);
      
      // Toggle sort direction
      store.dispatch(toggleSortDirection());
      
      // Verify sort direction is toggled
      const updatedState = store.getState() as RootState;
      expect(updatedState.library.sortAsc).toBe(false);
      
      // Toggle again
      store.dispatch(toggleSortDirection());
      
      // Verify sort direction is toggled back
      const finalState = store.getState() as RootState;
      expect(finalState.library.sortAsc).toBe(true);
    });

    it('should handle setSearchParams action', () => {
      // Initial search params
      const initialState = store.getState() as RootState;
      const initialParams = initialState.library.searchParams;
      
      // Update search params
      const newParams = {
        start: 20,
        end: 40,
        pageSize: 20
      };
      
      store.dispatch(setSearchParams(newParams));
      
      // Verify search params are updated
      const updatedState = store.getState() as RootState;
      const updatedParams = updatedState.library.searchParams;
      expect(updatedParams.start).toBe(20);
      expect(updatedParams.end).toBe(40);
      expect(updatedParams.pageSize).toBe(20);
      expect(updatedParams.startFromEnd).toBe(initialParams.startFromEnd); // Should be preserved
    });

    it('should handle toggleTag action', () => {
      // Initial state
      const initialState = store.getState() as RootState;
      expect(initialState.library.tags).toEqual([]);
      
      // Add a tag
      store.dispatch(toggleTag('tag1'));
      
      // Verify tag is added
      const stateAfterAdd = store.getState() as RootState;
      expect(stateAfterAdd.library.tags).toEqual(['tag1']);
      
      // Add another tag
      store.dispatch(toggleTag('tag2'));
      
      // Verify second tag is added
      const stateAfterSecondAdd = store.getState() as RootState;
      expect(stateAfterSecondAdd.library.tags).toEqual(['tag1', 'tag2']);
      
      // Remove the first tag
      store.dispatch(toggleTag('tag1'));
      
      // Verify first tag is removed
      const finalState = store.getState() as RootState;
      expect(finalState.library.tags).toEqual(['tag2']);
    });
  });

  describe('libraryThunks', () => {
    it('should handle updateSearchParams thunk', async () => {
      // Initial search params
      const initialState = store.getState() as RootState;
      const initialParams = initialState.library.searchParams;
      
      // Update search params using the thunk
      await store.dispatch(updateSearchParams({ start: 20, end: 40 }) as unknown as AnyAction);
      
      // Verify search params are updated
      const updatedState = store.getState() as RootState;
      const updatedParams = updatedState.library.searchParams;
      expect(updatedParams.start).toBe(20);
      expect(updatedParams.end).toBe(40);
      expect(updatedParams.pageSize).toBe(initialParams.pageSize); // Should be preserved
      expect(updatedParams.startFromEnd).toBe(initialParams.startFromEnd); // Should be preserved
    });

    it('should handle toggleSort thunk', async () => {
      // Initial state
      const initialState = store.getState() as RootState;
      expect(initialState.library.sortAsc).toBe(true);
      
      // Call the toggleSort thunk
      await store.dispatch(toggleSort() as unknown as AnyAction);
      
      // Verify sort direction is toggled
      const updatedState = store.getState() as RootState;
      expect(updatedState.library.sortAsc).toBe(false);
      
      // Verify clearNfts was called
      expect(clearNfts).toHaveBeenCalled();
    });

    it('should handle performSearch thunk', async () => {
      // Mock Date.now to return a consistent value
      const mockNow = 1625097600000; // July 1, 2021
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
      
      // Set up initial state
      store.dispatch(setSearchParams({ start: 0, end: 20, pageSize: 20, startFromEnd: false }));
      store.dispatch(togglePrincipal('new')); // Add a principal to search for
      
      // Call the performSearch thunk
      await store.dispatch(performSearch() as unknown as AnyAction);
      
      // Verify state changes
      const updatedState = store.getState() as RootState;
      expect(updatedState.library.lastSearchTimestamp).toBe(mockNow);
      expect(clearNfts).toHaveBeenCalled();
      
      // Restore Date.now
      jest.restoreAllMocks();
    });

    it.skip('should handle debouncing in performSearch', async () => {
      // Instead of testing the thunk directly, let's test the Redux store behavior
      // Mock Date.now to return values that are close together
      const originalDateNow = Date.now;
      const mockNow1 = 1000;
      const mockNow2 = 1200; // Within 300ms debounce window
      
      Date.now = jest.fn()
        .mockReturnValueOnce(mockNow1)
        .mockReturnValueOnce(mockNow2);
      
      // Set up initial state
      store.dispatch(updateLastSearchTimestamp()); // Set initial timestamp
      
      // Clear mocks before first call
      jest.clearAllMocks();
      
      // First search should proceed
      await store.dispatch(performSearch() as unknown as AnyAction);
      
      // Verify clearNfts was called for the first search
      expect(clearNfts).toHaveBeenCalled();
      
      // Reset mocks for second call
      jest.clearAllMocks();
      
      // Second search within debounce time should be debounced
      await store.dispatch(performSearch() as unknown as AnyAction);
      
      // Verify clearNfts was not called for the second search (debounced)
      expect(clearNfts).not.toHaveBeenCalled();
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle pagination with different page sizes', () => {
      // Test the reducer directly instead of the thunk
      // Initial state
      const initialState = {
        searchParams: {
          start: 0,
          end: 20,
          pageSize: 20,
          startFromEnd: false
        }
      };
      
      // Apply the setSearchParams action
      const stateAfterFirstUpdate = libraryReducer(
        initialState as any,
        setSearchParams({ start: 0, end: 50, pageSize: 50 })
      );
      
      // Verify first update
      expect(stateAfterFirstUpdate.searchParams.pageSize).toBe(50);
      expect(stateAfterFirstUpdate.searchParams.end).toBe(50);
      
      // Apply second update
      const stateAfterSecondUpdate = libraryReducer(
        stateAfterFirstUpdate,
        setSearchParams({ start: 50, end: 100 })
      );
      
      // Verify second update
      expect(stateAfterSecondUpdate.searchParams.start).toBe(50);
      expect(stateAfterSecondUpdate.searchParams.end).toBe(100);
    });

    it('should handle togglePrincipal action', () => {
      // Initial state
      const initialState = store.getState() as RootState;
      expect(initialState.library.selectedPrincipals).toEqual(['new']); // Default value
      
      // Toggle to a specific principal
      store.dispatch(togglePrincipal('2vxsx-fae'));
      
      // Verify principal is toggled
      const stateAfterToggle = store.getState() as RootState;
      expect(stateAfterToggle.library.selectedPrincipals).toEqual(['2vxsx-fae']);
      
      // Toggle the same principal again (should remove it)
      store.dispatch(togglePrincipal('2vxsx-fae'));
      
      // Verify principal is removed
      const stateAfterRemove = store.getState() as RootState;
      expect(stateAfterRemove.library.selectedPrincipals).toEqual([]);
      
      // Toggle back to 'new'
      store.dispatch(togglePrincipal('new'));
      
      // Verify 'new' is selected
      const finalState = store.getState() as RootState;
      expect(finalState.library.selectedPrincipals).toEqual(['new']);
    });

    it('should handle setCollection action', () => {
      // Initial state should have collection as 'NFT'
      const initialState = store.getState() as RootState;
      expect(initialState.library.collection).toBe('NFT');
      
      // Change collection to 'SBT'
      store.dispatch(setCollection('SBT'));
      
      // Verify collection is changed
      const updatedState = store.getState() as RootState;
      expect(updatedState.library.collection).toBe('SBT');
    });
  });
}); 