import { natToArweaveId } from "@/utils/id_convert";
import LedgerService from "@/utils/LedgerService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { emporium } from "../../../../../../declarations/emporium";
import { Listing, ListingItem } from "../types";

interface MyListingsResponse {
	nfts: Listing;
	totalPages: number;
	currentPage: number;
	pageSize: number;
}

interface GetListingsParams {
	page: number;
	size: number;
	sortByPrice: boolean | null;
	sortByTime: boolean | null;
}

export const getListings = createAsyncThunk<
	MyListingsResponse,
	GetListingsParams,
	{ rejectValue: string }
>(
	"imporium/listings/getListings",
	async ({ page, size, sortByPrice, sortByTime }, { rejectWithValue }) => {
		try {

			const ledgerService = LedgerService();

			// Fetch market listings
			const result = await emporium.get_listings(
				// page number defaults to 1 if not provided, so pass page + 1
				[BigInt(page + 1)],
				// page size defaults to 10 if not provided
				[BigInt(size)],
				// sortByPrice can be null, true, or false
				sortByPrice !== null ? [sortByPrice] : [],
				// sortByTime can be null, true, or false
				sortByTime !== null ? [sortByTime] : []
			);

			if (!result?.nfts || !Array.isArray(result.nfts) || result.nfts.length === 0) {
				console.warn("No market listings found.");
				return {
					nfts: {},
					totalPages: 0,
					currentPage: 0,
					pageSize: 0,
				};
			}

			// Process retrieved NFTs
			const listings: Listing = {};

			result.nfts.forEach(([tokenId, nft]) => {
				if ( nft?.token_id !== undefined && nft?.price !== undefined && nft?.owner !== undefined) {
					const arweaveId = natToArweaveId(BigInt(nft.token_id));
					const listItem: ListingItem = {
						tokenId: tokenId || "",
						arweaveId,
						price: ledgerService.e8sToIcp(nft.price).toString(),
						owner: nft.owner.toString(),
					};

					listings[arweaveId] = listItem;
				}
			});

			return {
				nfts: listings,
				totalPages: Number(result.total_pages || 0),
				pageSize: Number(result.page_size || size),
				currentPage: Number(result.current_page || 1) - 1,
			};
		} catch (error) {
			console.error("Error fetching market listings:", error);
			return rejectWithValue(
				"An error occurred while fetching market listings."
			);
		}
	}
);

export default getListings;
