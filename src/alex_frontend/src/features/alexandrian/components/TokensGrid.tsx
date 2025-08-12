import React from "react";
import { Skeleton } from "@/lib/components/skeleton";
// import { Masonry } from "react-plock";
import Nft from "@/features/nft";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { MintButton, SellButton } from "./../actions";
import type { AlexandrianToken } from "../types";
import { Button } from "@/lib/components/button";
import { Check } from "lucide-react";
import { AddToShelfButton } from "@/components/AddToShelfButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

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

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-center justify-items-center">
			{Object.values(tokens).map(token=> token.arweaveId.length === 43 &&  (
				<Nft
					key={token.id}
					id={token.arweaveId}
					checkNsfw={safe}
					action={
						user && <>
							<AddToShelfButton item={{ id: token.id, arweaveId: token.arweaveId, owner: token.owner }} />
							{token.owner === user.principal && token.collection !== "SBT" ? (
								<SellButton tokenId={token.id} />
							) : token.owner === emporium_canister_id ? (
								<Tooltip delayDuration={0}>
									<TooltipTrigger asChild>
										<Button variant="outline" scale="sm" className="px-1 py-4 opacity-60 cursor-auto hover:text-foreground">
											<Check />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="right" sideOffset={8} portal>Listed</TooltipContent>
								</Tooltip>
							) : (
								<MintButton token={token}/>
							)}
						</>
					}
					canister={token.owner!== emporium_canister_id ? canisters[token.owner] : undefined}
					token={token}
				/>
			))}
		</div>
	);


	// // Render tokens grid
	// return (
	// 	<Masonry
	// 		items={Object.values(tokens).filter(
	// 			(token) => token.arweaveId.length === 43
	// 		)}
	// 		config={{
	// 			columns: [1, 2, 3],
	// 			gap: [16, 16, 16],
	// 			media: [640, 768, 1024],
	// 		}}
	// 		render={(token: AlexandrianToken) => (
	// 			<Nft
	// 				key={token.id}
	// 				id={token.arweaveId}
	// 				checkNsfw={safe}
	// 				action={
	// 					user && <>
	// 						<AddToShelfButton item={{ id: token.id, arweaveId: token.arweaveId, owner: token.owner }} />
	// 						{token.owner === user.principal && token.collection !== "SBT" ? (
	// 							<SellButton tokenId={token.id} />
	// 						) : token.owner === emporium_canister_id ? (
	// 							<Tooltip delayDuration={0}>
	// 								<TooltipTrigger asChild>
	// 									<Button variant="outline" scale="sm" disabled className="px-1 py-4 rounded-t-none rounded-b">
	// 										<Check />
	// 									</Button>
	// 								</TooltipTrigger>
	// 								<TooltipContent side="right">
	// 									<p>Listed</p>
	// 								</TooltipContent>
	// 							</Tooltip>
	// 						) : (
	// 							<MintButton token={token}/>
	// 						)}
	// 					</>
	// 				}
	// 				owner={token.owner}
	// 				canister={canisters[token.owner]}
	// 				token={{
	// 					id: token.id,
	// 					collection: token.collection,
	// 				}}
	// 			/>
	// 		)}
	// 	/>
	// );
}
