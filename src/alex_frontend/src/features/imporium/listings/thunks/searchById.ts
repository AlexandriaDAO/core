import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";
import { RootState } from "@/store";
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";
import { Listing, ListingItem } from "../types";
import { ActorSubclass } from "@dfinity/agent/lib/cjs";
import { _SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import LedgerService from "@/utils/LedgerService";


// search by id
const searchById = createAsyncThunk<
	Listing, // Return structure
	{
		actor: ActorSubclass<_SERVICE>,
		query: string,
		owner?: string
	},
	{ rejectValue: string }
>(
	"imporium/listings/searchById",
	async ({actor, query, owner}, { rejectWithValue }) => {
		try {
			const result = await actor.search_caller_listing_by_token_id(
				arweaveIdToNat(query),
				owner ? [Principal.fromText(owner)] : []
			);

			if (result.length === 0) {
				return rejectWithValue("No nft found");
			}

			const ledgerService = LedgerService();

			const [tokenId, nft] = result[0];

			if ( nft?.token_id !== undefined && nft?.price !== undefined && nft?.owner !== undefined) {
				const arweaveId = natToArweaveId(BigInt(nft.token_id));
				const listItem: ListingItem = {
					tokenId: tokenId || "",
					arweaveId,
					price: ledgerService.e8sToIcp(nft.price).toString(),
					owner: nft.owner.toString(),
				};

				return { [arweaveId]: listItem };
			}

			return rejectWithValue("No nft found");
		} catch (error) {
			console.error("Error searching by id:", error);
			return rejectWithValue(
				"An unknown error occurred while searching by id"
			);
		}
	}
);
export default searchById;
