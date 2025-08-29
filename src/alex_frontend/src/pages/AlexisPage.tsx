import React, { useCallback } from "react";
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

// zdcg2-dqaaa-aaaap-qpnha-cai
const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;

function AlexisPage() {
	const dispatch = useAppDispatch();
	const {tokens, totalPages, totalItems, loading, updating, error, refresh } = useTokens();

	const { safe, page } = useAppSelector(state => state.alexandrian);
	const { user } = useAppSelector((state) => state.auth);


	const handlePageClick = useCallback((event: { selected: number }) => {
		dispatch(setPage(event.selected));
	},[dispatch]);

	const disabled = loading || updating;

	return (
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
					<FilterBar disabled={disabled} onRefresh={refresh} />
					<PaginationControls totalPages={totalPages} totalItems={totalItems} disabled={disabled} onPageClick={handlePageClick} />
				</div>

				{error && <Alert variant="danger" title="Error">{error}</Alert>}
            </div>

            <div className="w-full flex flex-col items-center gap-8">
				<NftProvider loading={loading} items={Object.values(tokens)} safe={safe}>
					{token => (
						<NFTCard
							id={token.arweaveId}
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
							// canister={token.owner!== emporium_canister_id ? canisters[token.owner] : undefined}
							token={token}
						/>
					)}
				</NftProvider>

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
			</div>
		</div>
	);
}

export default AlexisPage;
