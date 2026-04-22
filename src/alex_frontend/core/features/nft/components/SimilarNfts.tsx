import React from "react";
import { useSimilarNfts } from "../hooks/useSimilarNfts";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import NftProvider from "@/components/NftProvider";
import { NFTCard } from "@/features/nft";
import type { AlexandrianToken } from "@/features/alexandrian/types";

export default function SimilarNfts({ arweaveId }: { arweaveId: string }) {
	const { data: tokens, isLoading, error } = useSimilarNfts(arweaveId);
	const { safe } = useAppSelector((state) => state.alexandrian);

	if (error) return null;
	if (!isLoading && (!tokens || tokens.length === 0)) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-lg font-semibold">Similar NFTs</h2>
			<NftProvider loading={isLoading} items={tokens ?? []} safe={safe}>
				{(token: AlexandrianToken) => (
					<NFTCard id={token.arweaveId} token={token} />
				)}
			</NftProvider>
		</section>
	);
}
