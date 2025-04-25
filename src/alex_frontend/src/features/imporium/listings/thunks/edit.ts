import { createAsyncThunk } from "@reduxjs/toolkit";
import { arweaveIdToNat } from "@/utils/id_convert";

import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../declarations/emporium/emporium.did";

const edit = createAsyncThunk<
	void,
	{
		id: string;
		price: string;
		actor: ActorSubclass<_SERVICE>;
	},
	{ rejectValue: string } // Reject type
>(
	"imporium/listings/edit",
	async ({ id, price, actor }, { rejectWithValue }) => {
		try {
			const tokenId = arweaveIdToNat(id);

			// Format the price as BigInt
			const priceFormat: bigint = BigInt(
				Math.round(Number(price) * 10 ** 8) // Convert to fixed-point format
			);
			const result = await actor.update_nft_price(tokenId, priceFormat);
			if ("Err" in result) throw new Error(result?.Err); // Use rejectWithValue directly
		} catch (error) {
			return rejectWithValue(
				"An error occurred while updating the NFT." + error
			);
		}
	}
);

export default edit;
