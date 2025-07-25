import { arweaveIdToNat } from "@/utils/id_convert";
import type {
	Transaction,
	CanisterResponse,
	CanisterMintedResult,
} from "../types";
import type { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";

export const ARWEAVE_GRAPHQL_ENDPOINT = "https://arweave.net/graphql";

export async function checkMintedStatus(
	transactions: Transaction[],
	actor?: ActorSubclass<_SERVICE>
): Promise<Transaction[]> {
	if (!actor || transactions.length === 0) {
		return transactions;
	}

	try {
		const mintNumbers = transactions.map((tx) => arweaveIdToNat(tx.id));
		const mintedResults: CanisterResponse = await actor.nfts_exist(mintNumbers);

		if (mintedResults && "Ok" in mintedResults) {
			const booleanResults = (mintedResults as CanisterMintedResult).Ok;
			return transactions.map((tx, index) => ({ ...tx, minted: booleanResults[index] || false }));
		}
	} catch (error) {
		console.warn("Failed to check minted status:", error);
	}

	return transactions;
}
