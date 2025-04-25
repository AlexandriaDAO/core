import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { _SERVICE as EMPORIUM_SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import { _SERVICE as ICRC7_SERVICE } from "../../../../../../declarations/icrc7/icrc7.did";
import { ActorSubclass } from "@dfinity/agent/lib/cjs";
import { arweaveIdToNat } from "@/utils/id_convert";
import { wait } from "@/utils/lazyLoad";

const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

const listNft = createAsyncThunk<
	void,
	{
		id: string;
		price: string;
		actorEmporium: ActorSubclass<EMPORIUM_SERVICE>;
		actorIcrc7: ActorSubclass<ICRC7_SERVICE>;
	},
	{ rejectValue: string }
>(
	"imporium/nfts/listNft",
	async (
		{ id, price, actorEmporium, actorIcrc7 },
		{ rejectWithValue }
	) => {
		try {
			const tokenId = arweaveIdToNat(id);

			const priceFormat: bigint = BigInt( Math.round(Number(price) * 10 ** 8) );

			const isApproved = await actorIcrc7.icrc37_is_approved([
				{
					token_id: tokenId,
					from_subaccount: [],
					spender: {
						owner: Principal.fromText(emporium_canister_id),
						subaccount: [],
					},
				},
			]);

			if (isApproved[0] === false) {
				const resultApproveIcrc7 = await actorIcrc7.icrc37_approve_tokens([
					{
						token_id: tokenId,
						approval_info: {
							memo: [],
							from_subaccount: [],
							created_at_time: [],
							expires_at: [],
							spender: {
								owner: Principal.fromText(
									emporium_canister_id
								),
								subaccount: [],
							},
						},
					},
				]);
				if ("Err" in resultApproveIcrc7) throw new Error("Approval failed!");
			}

			const result = await actorEmporium.list_nft(tokenId, priceFormat);

			if ("Err" in result) throw new Error(result?.Err);
		} catch (error) {
			console.error("Error listing NFT:", error);

			return rejectWithValue(
				"An error occurred while listing the NFT." + error
			);
		}
	}
);

export default listNft;
