import { createAsyncThunk } from '@reduxjs/toolkit';
import { togglePrincipal, setLoading, setSearchParams, updateLastSearchTimestamp, setTotalItems, setCollection } from './librarySlice';
import { updateTransactions } from '@/apps/Modules/shared/state/content/contentDisplayThunks';
import { RootState } from '@/store';
import { toggleSortDirection } from './librarySlice';
import { AppDispatch } from '@/store';
import { fetchTokensForPrincipal, FetchTokensParams } from '../nftData/nftDataThunks';
import { clearNfts } from '../nftData/nftDataSlice';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../../declarations/icrc7_scion';
import { Principal } from '@dfinity/principal';

const DEBOUNCE_TIME = 300; // ms
const DEFAULT_PAGE_SIZE = 20;

export const togglePrincipalSelection = createAsyncThunk<
  string,
  string,
  { state: RootState; dispatch: AppDispatch }
>(
  'library/togglePrincipalSelection',
  async (principalId: string, { dispatch, getState }) => {
    try {
      dispatch(clearNfts());
      dispatch(togglePrincipal(principalId));

      // Get current collection type
      const state = getState();
      const collection = state.library.collection;

      // Get total NFT count for the selected principal
      let totalCount: bigint;
      if (principalId === 'new') {
        totalCount = await (collection === 'NFT' ? icrc7.icrc7_total_supply() : icrc7_scion.icrc7_total_supply());
      } else {
        const principal = Principal.fromText(principalId);
        const params = [{ owner: principal, subaccount: [] as [] }];
        const balance = await (collection === 'NFT' 
          ? icrc7.icrc7_balance_of(params)
          : icrc7_scion.icrc7_balance_of(params));
        totalCount = BigInt(balance[0]);
      }

      // Update total items in the store
      dispatch(setTotalItems(Number(totalCount)));

      // Reset search params to start from the beginning
      const pageSize = state.library.searchParams.pageSize;
      dispatch(setSearchParams({ 
        start: 0,
        end: Math.min(pageSize, Number(totalCount)),
        pageSize
      }));

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
      const { selectedPrincipals, collection, searchParams, totalItems } = state.library;
      const pageSize = searchParams.pageSize || DEFAULT_PAGE_SIZE;

      if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
        const params: FetchTokensParams = {
          principalId: selectedPrincipals[0],
          collection,
          page: 1,
          itemsPerPage: pageSize,
          startFromEnd: searchParams.startFromEnd,
          totalItems // Pass through the total items for proper pagination
        };

        if (searchParams.start !== undefined) {
          params.page = Math.floor(searchParams.start / pageSize) + 1;
        }
        
        const result = await dispatch(fetchTokensForPrincipal(params)).unwrap();
        
        const currentState = getState();
        // Don't update totalItems here since we want to preserve the actual total from the contract
        
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
  async (params, { dispatch, getState }) => {
    const state = getState();
    const currentStartFromEnd = state.library.searchParams.startFromEnd;
    dispatch(setSearchParams({ ...params, startFromEnd: currentStartFromEnd }));
  }
);

export const changeCollection = createAsyncThunk<
  void,
  'NFT' | 'SBT',
  { state: RootState; dispatch: AppDispatch }
>(
  'library/changeCollection',
  async (collectionType, { dispatch, getState }) => {
    try {
      dispatch(clearNfts());
      dispatch(setCollection(collectionType));
      
      const state = getState();
      const { selectedPrincipals } = state.library;
      
      // Get total count for the selected collection
      let totalCount: bigint;
      
      if (selectedPrincipals.length === 0 || selectedPrincipals[0] === 'new') {
        // For 'new' option or when no principal is selected, get total supply
        totalCount = await (collectionType === 'NFT' 
          ? icrc7.icrc7_total_supply() 
          : icrc7_scion.icrc7_total_supply());
      } else {
        // For specific principal, get their balance
        const principalId = selectedPrincipals[0];
        const principal = Principal.fromText(principalId);
        const params = [{ owner: principal, subaccount: [] as [] }];
        const balance = await (collectionType === 'NFT' 
          ? icrc7.icrc7_balance_of(params)
          : icrc7_scion.icrc7_balance_of(params));
        totalCount = BigInt(balance[0]);
      }
      
      // Update total items in the store
      dispatch(setTotalItems(Number(totalCount)));
      
      // Reset search params to start from the beginning
      const pageSize = state.library.searchParams.pageSize;
      dispatch(setSearchParams({ 
        start: 0,
        end: Math.min(pageSize, Number(totalCount)),
        pageSize
      }));
      
      // Perform search with the new collection type
      dispatch(performSearch());
      
    } catch (error) {
      console.error('Error in changeCollection:', error);
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(clearNfts());
  dispatch(toggleSortDirection());
  dispatch(performSearch());
};

