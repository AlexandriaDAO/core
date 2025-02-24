import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal, setLoading, setSearchParams, updateLastSearchTimestamp, setTotalItems } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal, FetchTokensParams } from '../nftData/nftDataThunks';
import { clearNfts } from '../nftData/nftDataSlice';

const DEBOUNCE_TIME = 300; // ms
const DEFAULT_PAGE_SIZE = 20;

export const togglePrincipalSelection = createAsyncThunk<
  string,
  string,
  { state: RootState; dispatch: AppDispatch }
>(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch }) => {
    try {
      dispatch(clearNfts());
      dispatch(togglePrincipal(principalId));
      return principalId;
    } catch (error) {
      console.error('Error in togglePrincipalSelection:', error);
      throw error;
    }
  }
);

export const performSearch = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>(
  'library/performSearch',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const now = Date.now();
    const timeSinceLastSearch = now - state.library.lastSearchTimestamp;
    
    if (timeSinceLastSearch < DEBOUNCE_TIME) {
      return;
    }

    dispatch(clearNfts());
    dispatch(updateLastSearchTimestamp());
    dispatch(setLoading(true));
    
    try {
      const { selectedPrincipals, collection, searchParams } = state.library;
      const pageSize = searchParams.pageSize || DEFAULT_PAGE_SIZE;

      if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
        const params: FetchTokensParams = {
          principalId: selectedPrincipals[0],
          collection,
          page: 1,
          itemsPerPage: pageSize,
          startFromEnd: searchParams.start === undefined
        };

        if (searchParams.start !== undefined) {
          params.page = Math.floor(searchParams.start / pageSize) + 1;
          params.startFromEnd = false;
        }
        
        const result = await dispatch(fetchTokensForPrincipal(params)).unwrap();
        
        const currentState = getState();
        dispatch(setTotalItems(currentState.nftData.totalNfts));
        
        const arweaveIds = Object.values(currentState.nftData.nfts)
          .filter(nft => 
            nft.principal === selectedPrincipals[0] && 
            nft.collection === collection
          )
          .map(nft => nft.arweaveId);

        const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
        await dispatch(updateTransactions(uniqueArweaveIds));
      }
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateSearchParams = createAsyncThunk<
  void,
  { start?: number; end?: number; pageSize?: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'library/updateSearchParams',
  async (params, { dispatch }) => {
    dispatch(setSearchParams(params));
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(clearNfts());
  dispatch(toggleSortDirection());
  dispatch(performSearch());
};

