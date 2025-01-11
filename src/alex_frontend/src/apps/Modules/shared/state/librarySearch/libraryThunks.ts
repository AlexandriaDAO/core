import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal, setLoading, setSearchParams, updateLastSearchTimestamp } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal, FetchTokensParams } from '../nftData/nftDataThunks';
import { cachePage, clearCache, clearNFTs } from '../nftData/nftDataSlice';

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
      dispatch(clearCache());
      dispatch(togglePrincipal(principalId));
      dispatch(performSearch());
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

    dispatch(clearNFTs());
    dispatch(updateLastSearchTimestamp());
    dispatch(setLoading(true));
    
    try {
      const { selectedPrincipals, collection, searchParams } = state.library;
      const pageSize = searchParams.pageSize || DEFAULT_PAGE_SIZE;
      const page = Math.floor(searchParams.start / pageSize) + 1;
      const pageKey = `${searchParams.start}-${searchParams.end}`;

      // Only use cache for "Show More" operations
      const isShowMore = searchParams.start > 0;
      if (isShowMore && state.nftData.cachedPages[pageKey]) {
        const arweaveIds = Object.values(state.nftData.nfts)
          .filter(nft => 
            nft.principal === selectedPrincipals[0] && 
            nft.collection === collection
          )
          .map(nft => nft.arweaveId);

        const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
        await dispatch(updateTransactions(uniqueArweaveIds));
        dispatch(setLoading(false));
        return;
      }

      if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
        const params: FetchTokensParams = {
          principalId: selectedPrincipals[0],
          collection,
          page,
          itemsPerPage: pageSize
        };
        
        await dispatch(fetchTokensForPrincipal(params)).unwrap();

        const currentState = getState();
        
        const arweaveIds = Object.values(currentState.nftData.nfts)
          .filter(nft => 
            nft.principal === selectedPrincipals[0] && 
            nft.collection === collection
          )
          .map(nft => nft.arweaveId);

        const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
        await dispatch(updateTransactions(uniqueArweaveIds));
        
        // Only cache for "Show More" operations
        if (isShowMore) {
          dispatch(cachePage(pageKey));
        }
      }
    } catch (error) {
      console.error('Error in performSearch:', error);
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
    dispatch(performSearch());
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(clearCache());
  dispatch(toggleSortDirection());
  dispatch(performSearch());
};

