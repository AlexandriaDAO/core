import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  togglePrincipal,
  setLoading,
  setSearchParams,
  updateLastSearchTimestamp,
  setTotalItems,
  setCollection,
} from "./librarySlice";
import { updateTransactions } from "@/apps/Modules/shared/state/transactions/transactionThunks";
import { RootState } from "@/store";
import { toggleSortDirection } from "./librarySlice";
import { AppDispatch } from "@/store";
import {
  fetchTokensForPrincipal,
  FetchTokensParams,
} from "../nftData/nftDataThunks";
import { clearNfts } from "../nftData/nftDataSlice";
import { Principal } from "@dfinity/principal";
import { createTokenAdapter, TokenType } from "../../adapters/TokenAdapter";
import { ALEX } from "../../../../../../../declarations/ALEX";
import { nft_manager } from "../../../../../../../declarations/nft_manager";

const DEBOUNCE_TIME = 300; // ms
const DEFAULT_PAGE_SIZE = 20;
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export const togglePrincipalSelection = createAsyncThunk<
  string,
  string,
  { state: RootState; dispatch: AppDispatch }
>(
  "library/togglePrincipalSelection",
  async (principalId: string, { dispatch, getState }) => {
    try {
      // Get current state
      const currentState = getState();
      const currentPrincipals = currentState.library.selectedPrincipals;

      // Only clear NFTs if we're changing principals (not just re-selecting)
      const isNewPrincipalSelection = !currentPrincipals.includes(principalId);
      if (isNewPrincipalSelection) {
        dispatch(clearNfts());
      }

      dispatch(togglePrincipal(principalId));

      // Get current collection type
      const state = getState();
      const collection = state.library.collection;

      // Create the appropriate token adapter
      const tokenAdapter = createTokenAdapter(collection as TokenType);

      // Get total NFT count for the selected principal
      let totalCount: bigint;
      if (principalId === "new") {
        totalCount = await tokenAdapter.getTotalSupply();
      } else {
        const principal = Principal.fromText(principalId);
        totalCount = await tokenAdapter.getBalanceOf(principal);
      }

      // Update total items in the store
      dispatch(setTotalItems(Number(totalCount)));

      // Reset search params to start from the beginning
      const pageSize = state.library.searchParams.pageSize;
      dispatch(
        setSearchParams({
          start: 0,
          end: Math.min(pageSize, Number(totalCount)),
          pageSize,
        })
      );

      return principalId;
    } catch (error) {
      console.error("Error in togglePrincipalSelection:", error);
      throw error;
    }
  }
);

export const performSearch = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>("library/performSearch", async (_, { getState, dispatch }) => {
  const state = getState();
  const now = Date.now();
  const timeSinceLastSearch = now - state.library.lastSearchTimestamp;

  if (timeSinceLastSearch < DEBOUNCE_TIME) {
    return;
  }

  // Check if we're adding more content to existing results
  const currentTransactions = state.transactions.transactions;
  const isInitialSearch = currentTransactions.length === 0;

  // Only clear NFTs if this is an initial search or if explicitly requested
  // This prevents wiping out NFT data when loading content after initial fetch
  if (isInitialSearch) {
    dispatch(clearNfts());
  }

  dispatch(updateLastSearchTimestamp());
  dispatch(setLoading(true));

  try {
    const { selectedPrincipals, collection, searchParams, totalItems } =
      state.library;
    const pageSize = searchParams.pageSize || DEFAULT_PAGE_SIZE;

    if (selectedPrincipals && selectedPrincipals.length > 0 && collection) {
      const params: FetchTokensParams = {
        principalId: selectedPrincipals[0],
        collection,
        page: 1,
        itemsPerPage: pageSize,
        startFromEnd: searchParams.startFromEnd,
        totalItems, // Pass through the total items for proper pagination
      };

      if (searchParams.start !== undefined) {
        params.page = Math.floor(searchParams.start / pageSize) + 1;
      }

      const result = await dispatch(fetchTokensForPrincipal(params)).unwrap();

      // If we need to update the total count
      if (totalItems === undefined || totalItems === 0) {
        const collectionType = collection;
        // Create the appropriate token adapter
        const tokenAdapter = createTokenAdapter(collectionType as TokenType);

        let totalCount: bigint;

        if (
          selectedPrincipals.length === 0 ||
          selectedPrincipals[0] === "new"
        ) {
          // For 'new' option or when no principal is selected, get total supply
          totalCount = await tokenAdapter.getTotalSupply();
        } else {
          // For specific principal, get their balance
          const principalId = selectedPrincipals[0];
          const principal = Principal.fromText(principalId);
          totalCount = await tokenAdapter.getBalanceOf(principal);
        }

        // Update total items in the store
        dispatch(setTotalItems(Number(totalCount)));
      }

      const currentState = getState();
      // Don't update totalItems here since we want to preserve the actual total from the contract

      const arweaveIds = Object.values(currentState.nftData.nfts)
        .filter(
          (nft) =>
            nft.principal === selectedPrincipals[0] &&
            nft.collection === collection
        )
        .map((nft) => nft.arweaveId);

      const uniqueArweaveIds = [...new Set(arweaveIds)] as string[];
      // function to get balance of alex balance 
      // const balanceIds = uniqueArweaveIds.map(async (id) => {
      //   const subaccount = await nft_manager.to_nft_subaccount(BigInt(id));
      //   const balanceParams = {
      //     owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
      //     subaccount: [Array.from(subaccount)],
      //   };
      //  const balance =await ALEX.icrc1_balance_of({
      //     owner: balanceParams.owner,
      //     subaccount: balanceParams.subaccount as [number[]]
      //   })
      //   return {
      //     id, balance
      //   }
      // });
      // console.log("balances",balanceIds);
      await dispatch(updateTransactions(uniqueArweaveIds));
    }
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateSearchParams = createAsyncThunk<
  void,
  { start?: number; end?: number; pageSize?: number },
  { state: RootState; dispatch: AppDispatch }
>("library/updateSearchParams", async (params, { dispatch, getState }) => {
  const state = getState();
  const currentStartFromEnd = state.library.searchParams.startFromEnd;
  dispatch(setSearchParams({ ...params, startFromEnd: currentStartFromEnd }));
});

export const changeCollection = createAsyncThunk<
  void,
  "NFT" | "SBT",
  { state: RootState; dispatch: AppDispatch }
>(
  "library/changeCollection",
  async (collectionType, { dispatch, getState }) => {
    try {
      dispatch(clearNfts());
      dispatch(setCollection(collectionType));

      const state = getState();
      const { selectedPrincipals } = state.library;

      // Create the appropriate token adapter
      const tokenAdapter = createTokenAdapter(collectionType as TokenType);

      // Get total count for the selected collection
      let totalCount: bigint;

      if (selectedPrincipals.length === 0 || selectedPrincipals[0] === "new") {
        // For 'new' option or when no principal is selected, get total supply
        totalCount = await tokenAdapter.getTotalSupply();
      } else {
        // For specific principal, get their balance
        const principalId = selectedPrincipals[0];
        const principal = Principal.fromText(principalId);
        totalCount = await tokenAdapter.getBalanceOf(principal);
      }

      // Update total items in the store
      dispatch(setTotalItems(Number(totalCount)));

      // Reset search params to start from the beginning
      const pageSize = state.library.searchParams.pageSize;
      dispatch(
        setSearchParams({
          start: 0,
          end: Math.min(pageSize, Number(totalCount)),
          pageSize,
        })
      );

      // Perform search with the new collection type
      dispatch(performSearch());
    } catch (error) {
      console.error("Error in changeCollection:", error);
      throw error;
    }
  }
);

export const toggleSort = () => (dispatch: AppDispatch) => {
  dispatch(clearNfts());
  dispatch(toggleSortDirection());
  dispatch(performSearch());
};
