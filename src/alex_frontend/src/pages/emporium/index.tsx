import React, { useCallback } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Alert } from "@/components/Alert";
import FilterBar from "@/features/marketplace/components/FilterBar";
import ResultsBar from "@/features/marketplace/components/ResultsBar";
import { Skeleton } from "@/lib/components/skeleton";
import { setPage, setPageSize } from "@/features/marketplace/marketplaceSlice";
import Nft from "@/features/nft";
import Purchase from "@/features/marketplace/actions/Purchase";
import { PaginationControls } from "@/features/marketplace/components/PaginationControls";
import {
	Coins,
	ShoppingCart,
	Users,
	TrendingUp,
} from "lucide-react";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { useListing } from "@/features/marketplace/hooks";
import Remove from "@/features/marketplace/actions/Remove";
import Update from "@/features/marketplace/actions/Update";

const EmporiumPage = () => {
	const dispatch = useAppDispatch();
	const { user, canisters } = useAppSelector((state) => state.auth);
	const { safe, page } = useAppSelector((state) => state.marketplace);

	// Fetch data using TanStack Query
	const { data, isLoading, isFetching, error, refresh, isEmpty } = useListing();

	const handlePageChange = useCallback((event: { selected: number }) => {
        dispatch(setPage(event.selected + 1)); // ReactPaginate uses 0-based index
    }, []);

	const handlePageSizeChange = useCallback((newSize: number) => {
        dispatch(setPageSize(newSize));
    }, []);

	const disabled = isLoading || isFetching;

	if (error) {
		return (
			<div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
				<Alert variant="danger" title="Error" className="w-full">
					{error}
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<UnauthenticatedWarning />

			<TopupBalanceWarning minimumBalance={15} />

			<div className="space-y-3 p-3 sticky top-2 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
				<div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full">
					<div className="flex flex-wrap justify-start items-start gap-3">
						<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-500/30">
							<ShoppingCart className="w-4 h-4" />
							NFT Marketplace
						</span>
						<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
							<Coins className="w-4 h-4" />
							ICP Payments
						</span>
						<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
							<Users className="w-4 h-4" />
							Community Trading
						</span>
						<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
							<TrendingUp className="w-4 h-4" />
							Price Discovery
						</span>
					</div>
					<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-400 dark:border-gray-600 whitespace-nowrap">
						<Coins className="w-4 h-4" />
						Each action burns 20 LBRY tokens
					</span>
				</div>

				<FilterBar onRefresh={refresh} disabled={disabled} />

				{data && <ResultsBar totalCount={data.total_count} />}
			</div>

			{isLoading ? (
				<Skeleton className="w-full flex-grow rounded h-96" />
			) : isEmpty ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground text-lg">
						No NFTs found matching your criteria.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{data?.nfts?.map((nft) => (
						<Nft
							key={`${nft.arweave_id}-${page}`}
							id={nft.arweave_id}
							checkNsfw={safe}
							action={
								nft.owner !== user?.principal ? (
									<Purchase nft={nft} />
								) : (
									<div className="flex gap-2 items-stretch justify-between">
										<Remove nft={nft} />
										<Update nft={nft}/>
									</div>
								)
							}
							price={nft.price}
							owner={nft.owner}
							canister={canisters[nft.owner]}
						/>
					))}
				</div>
			)}

			{data && data.total_pages > 1 && (
				<PaginationControls
					totalPages={data.total_pages}
					onPageClick={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
					disabled={disabled}
				/>
			)}
		</div>
	);
};

export default EmporiumPage;
