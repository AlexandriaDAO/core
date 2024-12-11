import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getMarketListing = createAsyncThunk<
  Record<
    string,
    { tokenId: string; arweaveId: string; price: string; owner: string }
  >,
  void,
  { rejectValue: string }
>("emporium/getMarketListing", async (_, { rejectWithValue, dispatch }) => {
  try {
    dispatch(setTransactions([]));

    const actorEmporium = await getActorEmporium();
    const ledgerServices = LedgerService();
    const result = await actorEmporium.get_listing();

    // Handle empty result case
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn("No market listings found");
      return {}; // Return empty object if no listings found
    }

    const ids: string[] = [];
    const tokensObject: Record<
      string,
      { tokenId: string; arweaveId: string; price: string; owner: string }
    > = {};

    result.forEach((value) => {
      // Null/undefined checks for each property in the listing
      if (
        value &&
        value[1] &&
        value[1].token_id !== undefined &&
        value[1].price !== undefined &&
        value[1].owner !== undefined
      ) {
        const arweaveId = natToArweaveId(BigInt(value[1].token_id));
        const price = ledgerServices.e8sToIcp(value[1].price).toString();
        ids.push(arweaveId);

        tokensObject[arweaveId] = {
          tokenId: value[0] || "",
          arweaveId,
          price,
          owner: value[1].owner.toString(),
        };
      }
    });

    // Handle case where no valid tokens were processed
    if (ids.length === 0) {
      console.warn("No valid tokens found in market listings");
      return tokensObject; // Return empty object when no valid tokens
    }

    // Fetch transactions for the valid tokens
    const fetchedTransactions = await fetchTransactionsApi({ nftIds: ids });

    // Handle empty transactions case
    if (!fetchedTransactions || fetchedTransactions.length === 0) {
      console.warn("No transactions found for the market listings");
      return tokensObject; // Return tokensObject even if no transactions found
    }

    dispatch(setTransactions(fetchedTransactions));
    await dispatch(loadContentForTransactions(fetchedTransactions));

    return tokensObject;
  } catch (error) {
    console.error("Error fetching market listing:", error);
    return rejectWithValue(
      "An unknown error occurred while fetching market listing"
    );
  }
});

export default getMarketListing;