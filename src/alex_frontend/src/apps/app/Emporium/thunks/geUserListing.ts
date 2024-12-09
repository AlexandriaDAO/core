import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserListing = createAsyncThunk<
  Record<
    string,
    { tokenId: string; arweaveId: string; price: string; owner: string }
  >, // Return type
  void,
  { rejectValue: string }
>("emporium/getUserListing", async (_, { rejectWithValue, dispatch }) => {
  try {
    // Clear any previous transactions
    dispatch(setTransactions([]));

    // Fetch caller's listing
    const actorEmporium = await getActorEmporium();
    const ledgerServices = LedgerService();
    const result = await actorEmporium.get_caller_listing();

    console.log("Raw result:", result);

    // Handle empty result case
    if (!Array.isArray(result) || result.length === 0) {
      console.warn("No listings found for the caller.");
      return {};
    }

    // Initialize containers for processing
    const ids: string[] = [];
    const tokensObject: Record<
      string,
      { tokenId: string; arweaveId: string; price: string; owner: string }
    > = {};

    // Process the result
    result.forEach((value) => {
      const arweaveId = natToArweaveId(BigInt(value[1].token_id));
      const price = ledgerServices.e8sToIcp(value[1].price).toString();
      ids.push(arweaveId);

      tokensObject[arweaveId] = {
        tokenId: value[0],
        arweaveId,
        price,
        owner: value[1].owner.toString(),
      };
    });

    // Fetch transactions only if there are valid IDs
    if (ids.length > 0) {
      const fetchedTransactions = await fetchTransactionsApi({ nftIds: ids });
      console.log("Transactions fetched:", fetchedTransactions);
      dispatch(setTransactions(fetchedTransactions));
      await dispatch(loadContentForTransactions(fetchedTransactions));
    }

    console.log("Processed Tokens Object:", tokensObject);
    return tokensObject;
  } catch (error) {
    console.error("Error fetching ICRC7 tokens:", error);
    return rejectWithValue(
      "An unknown error occurred while fetching ICRC7 tokens"
    );
  }
});

export default getUserListing;
