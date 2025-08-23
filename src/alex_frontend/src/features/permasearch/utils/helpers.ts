import { arweaveIdToNat } from "@/utils/id_convert";
import type {
	Transaction,
	CanisterResponse,
	CanisterMintedResult,
	TagFilter,
	Filters
} from "../types";
import type { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";
import { estimateBlockHeight, fetchBlockHeightForTimestamp, getBlockHeightForTimestamp, getCurrentBlockHeight } from "./blocks";

export const ARWEAVE_GRAPHQL_ENDPOINT = "https://arweave.net/graphql";

export async function filterAvailableAssets(
	transactions: Transaction[],
	canister?: string,
	signal?: AbortSignal
): Promise<Transaction[]> {
	const isLocal = process.env.DFX_NETWORK === "local";

	const checkPromises = transactions.map(async (tx) => {
		// Check Arweave first (most common)
		const arweaveUrl = `https://arweave.net/${tx.id}`;

		try {
			const arweaveResponse = await fetch(arweaveUrl, { method: 'HEAD', signal });
			if (arweaveResponse.ok) return tx;
		} catch {}

		// Check canister if available
		if (canister) {
			try {
				const baseUrl = isLocal ? `http://${canister}.localhost:4943` : `https://${canister}.raw.icp0.io`;
				const canisterUrl = `${baseUrl}/arweave/${tx.id}`;
				const canisterResponse = await fetch(canisterUrl, { method: 'HEAD', signal });
				if (canisterResponse.ok) return tx;
			} catch {}
		}

		return null; // Asset not available
	});

	const results = await Promise.all(checkPromises);
	return results.filter((tx): tx is Transaction => tx !== null);
}

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




export function buildTagFilters(filters: Filters): TagFilter[] {
    const tags: TagFilter[] = [];
    const allContentTypes = [...filters.types];

    if (filters.customType.trim()) allContentTypes.push(filters.customType.trim());

    if (allContentTypes.length > 0) {
        tags.push({
            name: "Content-Type",
            values: allContentTypes,
        });
    }

    filters.tags.forEach((tag) => {
        const existingTag = tags.find((t) => t.name === tag.name);
        if (existingTag) {
            if (!existingTag.values.includes(tag.value)) {
                existingTag.values.push(tag.value);
            }
        } else {
            tags.push({ name: tag.name, values: [tag.value] });
        }
    });

    return tags;
}

/**
 * Build block range for GraphQL queries based on timestamp and include parameters
 *
 * @param timestamp - Target timestamp to search around (optional)
 * @param include - Block range size from include to target (optional)
 * @returns Promise<{min: number, max: number}> - Block range for GraphQL query
 */
export async function buildBlockFilters(timestamp?: number, include?: number): Promise<{ min: number; max: number }> {
    const current = await getCurrentBlockHeight();

	if (timestamp) {
        const targetBlock = await fetchBlockHeightForTimestamp(timestamp, current);
        const max = Math.min(current, targetBlock);
        const min = include ? Math.max(0, targetBlock - include) : 0;
        console.log("Block range:", { min, max, targetBlock, include });
        return { min, max };
    } else {
        const max = current - 30;
        const min = include ? Math.max(0, current - include) : 0;
        console.log("Block range:", { min, max, current, include });
        return { min, max };
    }
}