import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Alert } from "@/components/Alert";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";

// Redux actions for UI state
import { setPage } from "@/features/alexandrian/alexandrianSlice";

// TanStack Query hook for token data
import useTokens from "@/features/alexandrian/hooks/useTokens";

// Components
import { NFTCard } from "@/features/nft";
import { FilterBar, PaginationControls } from "@/features/alexandrian/components";
import { MintButton, SellButton } from "@/features/alexandrian/actions";
import NftProvider from "@/components/NftProvider";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { AddToShelfButton } from "@/components/AddToShelfButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { Button } from "@/lib/components/button";
import { Check, LoaderPinwheel } from "lucide-react";
import { useAlexBackend } from "@/hooks/actors";
import { flushEngagement } from "@/services/engagementService";
import { AlexandrianToken } from "@/features/alexandrian/types";
import { arweaveIdToNat } from "@/utils/id_convert";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { alex_backend } from "../../../../declarations/alex_backend";

const EMBEDDING_SERVER =
	process.env.REACT_APP_EMBEDDING_SERVER || "https://lbry.youthumber.com";

// zdcg2-dqaaa-aaaap-qpnha-cai
const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

function AlexandrianPage() {
	const dispatch = useAppDispatch();
	const {tokens, totalPages, totalItems, loading, updating, error, refresh } = useTokens();

	const { safe, page, pageSize } = useAppSelector(state => state.alexandrian);
	const { user } = useAppSelector((state) => state.auth);
	const { actor: alexBackendActor } = useAlexBackend();

	const [searchResults, setSearchResults] = useState<AlexandrianToken[] | null>(null);
	const [searching, setSearching] = useState(false);

	const handleSearch = async (query: string) => {
		setSearching(true);
		try {
			const embedRes = await fetch(`${EMBEDDING_SERVER}/embed/text`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});
			if (!embedRes.ok) throw new Error("Failed to get embedding");

			const { embedding } = await embedRes.json();
			const result = await alex_backend.search_by_vector(embedding, pageSize);

			if ("Ok" in result) {
				const adapter = createTokenAdapter("NFT");
				const tokens = await Promise.all(
					result.Ok.map(async (r: any) => {
						const tokenId = arweaveIdToNat(r.arweave_id);
						const ownerResult = await adapter.getOwnerOf([tokenId]);
						const owner = ownerResult?.[0]?.[0]?.owner?.toString() || "";
						const icpInfo = await adapter.tokenToIcpInfo(tokenId);
						return {
							id: tokenId.toString(),
							arweaveId: r.arweave_id,
							owner,
							collection: "NFT" as const,
							...icpInfo,
						} as AlexandrianToken;
					})
				);
				setSearchResults(tokens);
			}
		} catch (e) {
			console.error("Search failed:", e);
		} finally {
			setSearching(false);
		}
	};

	const handleClearSearch = () => {
		setSearchResults(null);
	};

	useEffect(() => {
		return () => {
			if (alexBackendActor) flushEngagement(alexBackendActor);
		};
	}, [alexBackendActor]);


	const handlePageClick = useCallback((event: { selected: number }) => {
		dispatch(setPage(event.selected));
	},[dispatch]);

	const disabled = loading || updating;

	const renderCard = (token: AlexandrianToken) => (
		<NFTCard
			id={token.arweaveId}
			action={user && (
				<>
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
						<MintButton token={token} />
					)}
				</>
			)}
			token={token}
		/>
	);

	return (
		<>
		<Helmet>
			<title>Alexandrian - Browse NFTs & SBTs | Alexandria</title>
			<meta name="description" content="Browse and discover NFTs and SBTs from the Alexandrian library. Like, mint, and trade digital assets." />
		</Helmet>
		<div className="py-10 px-4 flex-grow flex gap-8 flex-col items-center justify-center">
            <div className="max-w-5xl w-full flex flex-col gap-8">
                <div className="flex flex-col justify-center items-center gap-6 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Alexandrian
                        </h1>
						<div className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
							<p> Browse and discover NFTs and SBTs from the Alexandrian library. </p>
							<p> Likes cost 10 LBRY {"("}5 burned | 5 to the creator{")"}.</p>
						</div>
                    </div>
                </div>

				<UnauthenticatedWarning />

				<TopupBalanceWarning />

                <div className="space-y-3 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
					<FilterBar disabled={disabled} onRefresh={refresh} onSearch={handleSearch} onClearSearch={handleClearSearch} searching={searching} />
					<PaginationControls totalPages={totalPages} totalItems={totalItems} disabled={disabled} onPageClick={handlePageClick} />
				</div>

				{error && <Alert variant="danger" title="Error">{error}</Alert>}
            </div>

            <div className="w-full flex flex-col items-center gap-8">
				<NftProvider
					loading={searchResults ? searching : loading}
					items={searchResults ?? Object.values(tokens)}
					safe={safe}
				>
					{renderCard}
				</NftProvider>

				{!searchResults && (
					<div className="flex justify-center mt-6 mb-8">
						{ (loading || updating) ? (
							<Button disabled={true} className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors flex items-center">
								<LoaderPinwheel className="animate-spin mr-2 h-4 w-4" /> Loading more...
							</Button>
						): page < (totalPages - 1) ? (
							<Button
								onClick={() => dispatch(setPage(page + 1))}
								disabled={disabled}
								className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors"
							>
								{loading || updating ? 'Loading...' : 'Load More'}
							</Button>
						) : (
							<p className="text-base font-medium text-gray-900 dark:text-gray-100">
								That's all for now!
							</p>
						)}
					</div>
				)}
			</div>
		</div>
		</>
	);
}

export default AlexandrianPage;