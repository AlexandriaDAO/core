import { createAsyncThunk } from "@reduxjs/toolkit";
import { arweaveIdToNat } from "@/utils/id_convert";

import { _SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import { ActorSubclass } from "@dfinity/agent/lib/cjs";

const removeListedNft = createAsyncThunk<
	void,
	{
		id: string;
		actorEmporium: ActorSubclass<_SERVICE>;
	},
	{ rejectValue: string }
>(
	"imporium/listings/unlistNft",
	async ({ id, actorEmporium }, { rejectWithValue }) => {
		try {
			const tokenId = arweaveIdToNat(id);
			const result = await actorEmporium.remove_nft_listing(tokenId);

			if ("Err" in result) throw new Error(result?.Err);
		} catch (error) {
			console.error("Error unlisting NFT:", error);
			return rejectWithValue(
				"An error occurred while canceling listed NFT." + error
			);
		}
	}
);

export default removeListedNft;