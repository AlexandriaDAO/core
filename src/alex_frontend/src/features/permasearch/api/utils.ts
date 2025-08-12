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
import { estimateBlockHeight, getCurrentBlockHeight } from "../utils";

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

export async function buildBlockRange(dateRange: { from?: string; to?: string }): Promise<{ min?: number; max?: number }> {
    if (!dateRange.from && !dateRange.to) {
        return {};
    }

    try {
        const currentBlockHeight = await getCurrentBlockHeight();
        let minBlock: number | undefined;
        let maxBlock: number | undefined;

        if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
            minBlock = estimateBlockHeight(fromTimestamp, currentBlockHeight);
        }

        if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999); // End of day
            const toTimestamp = Math.floor(toDate.getTime() / 1000);
            maxBlock = estimateBlockHeight(toTimestamp, currentBlockHeight);
        }

        return { min: minBlock, max: maxBlock };
    } catch (error) {
        console.warn('Failed to build block range from date range:', error);
        return {};
    }
}