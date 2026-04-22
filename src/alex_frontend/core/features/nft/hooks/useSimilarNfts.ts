import { useQuery } from "@tanstack/react-query";
import { useAlexBackend } from "@/hooks/actors";
import { arweaveIdToNat } from "@/utils/id_convert";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import type { AlexandrianToken } from "@/features/alexandrian/types";

const EMBEDDING_SERVER =
	process.env.REACT_APP_EMBEDDING_SERVER || "https://lbry.youthumber.com";

const TOP_K = 20;

interface SimilarityHit {
	arweave_id: string;
	score: number;
}

export function useSimilarNfts(arweaveId: string | null) {
	const { actor } = useAlexBackend();

	return useQuery({
		queryKey: ["similar-nfts", arweaveId],
		queryFn: async (): Promise<AlexandrianToken[]> => {
			const id = arweaveId!;

			// Fast path: canister already has an embedding for this ID.
			const indexed = await actor!.search_similar(id, TOP_K);
			let hits: SimilarityHit[];

			if ("Ok" in indexed) {
				hits = indexed.Ok;
			} else {
				// Fallback: ask the server to verify+embed the Arweave image,
				// then cosine-search the canister by the returned vector.
				const res = await fetch(`${EMBEDDING_SERVER}/embed/arweave`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ arweave_id: id }),
				});
				if (!res.ok) {
					const body = await res.json().catch(() => ({}));
					throw new Error(body.detail ?? `embed/arweave ${res.status}`);
				}
				const { embedding } = await res.json();
				const vecRes = await actor!.search_by_vector(embedding, TOP_K);
				if (!("Ok" in vecRes)) throw new Error(vecRes.Err);
				hits = vecRes.Ok;
			}

			const adapter = createTokenAdapter("NFT");
			return Promise.all(
				hits.map(async (r) => {
					const tokenId = arweaveIdToNat(r.arweave_id);
					const ownerRes = await adapter.getOwnerOf([tokenId]);
					const owner = ownerRes?.[0]?.[0]?.owner?.toString() || "";
					const icpInfo = await adapter.tokenToIcpInfo(tokenId);
					return {
						id: tokenId.toString(),
						arweaveId: r.arweave_id,
						owner,
						collection: "NFT" as const,
						...icpInfo,
					} as AlexandrianToken;
				}),
			);
		},
		enabled: !!actor && !!arweaveId,
		staleTime: Infinity,
		gcTime: 60 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: (n, err) => {
			const msg = (err as Error).message?.toLowerCase() ?? "";
			if (msg.includes("not an image") || msg.includes("not a valid image")) return false;
			return n < 1;
		},
	});
}
