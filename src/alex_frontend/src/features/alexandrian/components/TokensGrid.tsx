import React from "react";
import { Skeleton } from "@/lib/components/skeleton";
import { Masonry } from "react-plock";
import Nft from "@/features/nft";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { AddToShelfButton, MintButton, SellButton } from "./../actions";
import type { AlexandrianToken } from "../types";
import { Button } from "@/lib/components/button";

// zdcg2-dqaaa-aaaap-qpnha-cai
const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

interface TokensGridProps {
	// Only TanStack Query states
	tokens: Record<string, AlexandrianToken>;
	loading: boolean;
}

export function TokensGrid({ tokens, loading }: TokensGridProps) {
	// Get Redux states directly
	const { collectionType, safe, page, selectedUser } = useAppSelector(
		(state) => state.alexandrian
	);
	const { user, canisters } = useAppSelector((state) => state.auth);
	// Loading skeleton
	if (loading && Object.keys(tokens).length === 0) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(9)].map((_, i) => (
					<Skeleton key={i} className="h-64 rounded-lg" />
				))}
			</div>
		);
	}

	// No tokens found
	if (Object.keys(tokens).length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">
					No {collectionType}s found
				</p>
			</div>
		);
	}

	// Render tokens grid
	return (
		<Masonry
			items={Object.values(tokens).filter(
				(token) => token.arweaveId.length === 43
			)}
			config={{
				columns: [1, 2, 3],
				gap: [16, 16, 16],
				media: [640, 768, 1024],
			}}
			render={(token: AlexandrianToken) => (
				<Nft
					key={`${token.id}-${page}-${collectionType}-${selectedUser}`}
					id={token.arweaveId}
					checkNsfw={safe}
					action={
						user && (
							<div className="flex gap-2">
								{token.owner === user.principal && token.collection !== "SBT" ? (
									<SellButton tokenId={token.id} />
								) : token.owner === emporium_canister_id ? (
									<Button variant="outline" scale="sm" disabled>Listed</Button>
								) : (
									<MintButton token={token}/>
								)}
								<AddToShelfButton token={token} />
							</div>
						)
					}
					owner={token.owner}
					canister={canisters[token.owner]}
					token={{
						id: token.id,
						collection: token.collection,
					}}
				/>
			)}
		/>
	);
}
