import { createAsyncThunk } from "@reduxjs/toolkit";
import { natToArweaveId } from "@/utils/id_convert";
import { Listing, ListingItem } from "../types";
import { emporium } from "../../../../../../declarations/emporium/index";
import LedgerService from "@/utils/LedgerService";

const search = createAsyncThunk<
	Listing, // Return structure
	string,
	{ rejectValue: string }
>(
	"imporium/listings/search",
	async (query, { rejectWithValue }) => {
		try {
			const result = await emporium.search_listing(query);

			if (result.length === 0) {
				return rejectWithValue("No nfts found");
			}

			const ledgerService = LedgerService();


			// Process retrieved NFTs
			const listings: Listing = {};

			result.forEach(([tokenId, nft]) => {
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

			if (Object.keys(listings).length === 0) {
				return rejectWithValue("No nfts found");
			}

			return listings;
		} catch (error) {
			console.error("Error searching:", error);
			return rejectWithValue(
				"An unknown error occurred while searching"
			);
		}
	}
);
export default search;
