import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal, setLoading } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal, FetchTokensParams } from '../nftData/nftDataThunks';
import { cachePage, clearCache, clearNFTs } from '../nftData/nftDataSlice';

export const togglePrincipalSelection = createAsyncThunk(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch }) => {
    try {
      dispatch(clearCache());
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
  { start: number; end: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'library/performSearch',
  async ({ start, end }, { getState, dispatch }) => {
    // Clear existing NFTs before performing new search
    dispatch(clearNFTs());
    
    try {
      const state = getState();
      const selectedPrincipals = state.library.selectedPrincipals;
      const collection = state.library.collection;
      const pageKey = `${start}-${end}`;

      // Return early if page is already cached
      if (state.nftData.cachedPages[pageKey]) {
        const arweaveIds = Object.values(state.nftData.nfts)
          .filter(nft => 
            nft.principal === selectedPrincipals[0] && 
            nft.collection === collection
          )
          .map(nft => nft.arweaveId);

        const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
        await dispatch(updateTransactions(uniqueArweaveIds));
        return;
      }

      dispatch(setLoading(true));

      if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
        const params: FetchTokensParams = {
          principalId: selectedPrincipals[0],
          collection,
          range: { start, end }
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
        
        // Cache the page
        dispatch(cachePage(pageKey));
      }
      
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error in performSearch:', error);
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(clearCache());
  dispatch(toggleSortDirection());
};

