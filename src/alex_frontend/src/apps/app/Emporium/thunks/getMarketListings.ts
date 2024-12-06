import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "azle";

const getMarketListings = createAsyncThunk<
  Record<
    string,
    { tokenId: string; arweaveId: string; price: string; owner: string }
  >, // Return type
  void,
  { rejectValue: string }
>("emporium/getMarketListings", async (_, { rejectWithValue, dispatch }) => {
  try {
    dispatch(setTransactions([]));

    const actorEmporium = await getActorEmporium();
    const ledgerServices = LedgerService();
    const result = await actorEmporium.get_listing();

    console.log("Raw result:", result);

    const ids: string[] = [];
    const tokensObject: Record<
      string,
      { tokenId: string; arweaveId: string; price: string; owner: string }
    > = {};

    if (Array.isArray(result)) {
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
    }

    const fetchedTransactions = await fetchTransactionsApi({ nftIds: ids });
    console.log("transactions are ", fetchedTransactions);
    dispatch(setTransactions(fetchedTransactions));
    await dispatch(loadContentForTransactions(fetchedTransactions));

    console.log("Tokens Object:", tokensObject);
    return tokensObject;
  } catch (error) {
    console.error("Error fetching ICRC7 tokens:", error);
    return rejectWithValue(
      "An unknown error occurred while fetching ICRC7 tokens"
    );
  }
});

export default getMarketListings;
