import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserListing = createAsyncThunk<
  {
    nfts: Record<
      string,
      {
        tokenId: string;
        arweaveId: string;
        price: string;
        owner: string;
      }
    >;
    totalPages: string;
    pageSize: string;
  },
  number,
  { rejectValue: string }
>("emporium/getUserListing", async (page, { rejectWithValue, dispatch }) => {
  try {
    dispatch(setTransactions([]));

    const actorEmporium = await getActorEmporium();
    const ledgerServices = LedgerService();
    const result = await actorEmporium.get_caller_listing([BigInt(page)],[BigInt(2)]);
    if (
      !result.nfts ||
      !Array.isArray(result.nfts) ||
      result.nfts.length === 0
    ) {
      return {
        nfts: {},
        totalPages: "0",
        pageSize: "0",
      };
    }

    const ids: string[] = [];
    const tokensObject: Record<
      string,
      { tokenId: string; arweaveId: string; price: string; owner: string }
    > = {};

    result.nfts.forEach((value) => {
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

    if (ids.length === 0) {
      return {
        nfts: tokensObject,
        totalPages: result.total_pages?.toString() || "0",
        pageSize: result.page_size?.toString() || "0",
      };
    }

    const fetchedTransactions = await fetchTransactionsApi({ nftIds: ids });

    if (!fetchedTransactions || fetchedTransactions.length === 0) {
      return {
        nfts: tokensObject,
        totalPages: result.total_pages?.toString() || "0",
        pageSize: result.page_size?.toString() || "0",
      };
    }

    dispatch(setTransactions(fetchedTransactions));
    await dispatch(loadContentForTransactions(fetchedTransactions));

    return {
      nfts: tokensObject,
      totalPages: result.total_pages.toString(),
      pageSize: result.page_size.toString(),
    };
  } catch (error) {
    console.error("Error fetching user listing:", error);
    return rejectWithValue(
      "An unknown error occurred while fetching user listing"
    );
  }
});

export default getUserListing;
