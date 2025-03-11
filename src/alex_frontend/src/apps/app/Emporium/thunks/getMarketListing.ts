import { fetchTransactionsForAlexandrian } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { setTransactions } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/transactions/transactionThunks";
import { getActorEmporium } from "@/features/auth/utils/authUtils";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";

interface MarketListingResponse {
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
  totalCount: number;
  pageSize: string;
}

interface MarketListingParams {
  page: number;
  searchStr: string;
  pageSize: string;
  sort: string;
  type: string;
  userPrincipal: string;
}

export const getMarketListing = createAsyncThunk<
  MarketListingResponse,
  MarketListingParams,
  { rejectValue: string }
>(
  "emporium/getMarketListing",
  async ({ page, searchStr, pageSize, sort, type, userPrincipal }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setTransactions([])); // Clear transactions before fetching new ones.

      const actorEmporium = await getActorEmporium();
      const ledgerService =  LedgerService();

      // Initialize filters
      let ownerFilter: [] | [Principal] = [];
      let tokenFilter: [] | [bigint] = [];
      let sortFilter: [] | [string] = sort ? [sort] : [];
      let timeFilter: string = "desc";

      // Determine filters based on the type
      switch (type) {
        case "principal":
          ownerFilter = searchStr ? [Principal.fromText(searchStr)] : [];
          break;
        case "token":
          tokenFilter = searchStr ? [arweaveIdToNat(searchStr)] : [];
          break;
        case "userListings":
          ownerFilter = [Principal.fromText(userPrincipal)];
          tokenFilter = searchStr ? [arweaveIdToNat(searchStr)] : [];
          break;
        default:
          timeFilter = "desc"; // Default sorting by time
      }

      // Fetch market listings
      const result = await actorEmporium.get_search_listing(
        [BigInt(page)],
        [BigInt(pageSize)],
        sortFilter,
        tokenFilter,
        [timeFilter],
        ownerFilter,
        type
      );

      if (!result?.nfts || !Array.isArray(result.nfts) || result.nfts.length === 0) {
        console.warn("No market listings found.");
        return { nfts: {}, totalPages: "0", totalCount: 0, pageSize: "0" };
      }

      // Process retrieved NFTs
      const nftIds: string[] = [];
      const nftsObject: Record<string, { tokenId: string; arweaveId: string; price: string; owner: string }> = {};

      result.nfts.forEach(([tokenId, nft]) => {
        if (nft?.token_id !== undefined && nft?.price !== undefined && nft?.owner !== undefined) {
          const arweaveId = natToArweaveId(BigInt(nft.token_id));
          const price = ledgerService.e8sToIcp(nft.price).toString();
          nftIds.push(arweaveId);

          nftsObject[arweaveId] = {
            tokenId: tokenId || "",
            arweaveId,
            price,
            owner: nft.owner.toString(),
          };
        }
      });

      if (nftIds.length === 0) {
        console.warn("No valid tokens found in market listings.");
        return {
          nfts: nftsObject,
          totalPages: result.total_pages?.toString() || "0",
          pageSize: result.page_size?.toString() || "0",
          totalCount: 0,
        };
      }
      // Fetch transactions for the retrieved NFTs
      const transactions = await fetchTransactionsForAlexandrian(nftIds);

      if (!transactions || transactions.length === 0) {
        console.warn("No transactions found for the listed NFTs.");
        return {
          nfts: nftsObject,
          totalPages: result.total_pages?.toString() || "0",
          pageSize: result.page_size?.toString() || "0",
          totalCount: 0,
        };
      }

      // Dispatch transactions to the state
      dispatch(setTransactions(transactions));
      await dispatch(loadContentForTransactions(transactions) as unknown as AnyAction);

      return {
        nfts: nftsObject,
        totalPages: result.total_pages.toString(),
        pageSize: result.page_size.toString(),
        totalCount: nftIds.length,
      };
    } catch (error) {
      console.error("Error fetching market listings:", error);
      return rejectWithValue("An error occurred while fetching market listings.");
    }
  }
);

export default getMarketListing;
