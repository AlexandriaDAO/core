import React, { useCallback } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Alert } from "@/components/Alert";
import FilterBar from "@/features/marketplace/components/FilterBar";
import { setPage, setPageSize, setSafe } from "@/features/marketplace/marketplaceSlice";
import Nft from "@/features/nft";
import Purchase from "@/features/marketplace/actions/Purchase";
import { PaginationControls } from "@/features/marketplace/components/PaginationControls";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { useListing } from "@/features/marketplace/hooks";
import Remove from "@/features/marketplace/actions/Remove";
import Update from "@/features/marketplace/actions/Update";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import NftProvider from "@/components/NftProvider";

const EmporiumPage = () => {
	const dispatch = useAppDispatch();
	const { user, canisters } = useAppSelector((state) => state.auth);
	const { safe } = useAppSelector((state) => state.marketplace);

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
		<div className="sm:w-10/12 flex flex-col gap-4">
			<UnauthenticatedWarning />

			<TopupBalanceWarning minimumBalance={15} />

			<div className="space-y-3 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="text-sm text-muted-foreground">
						Each action burns 20 LBRY tokens.
					</div>
					{/* <div className="flex flex-wrap items-center gap-4"> */}
					<SafeSearchToggle enabled={safe} setEnabled={() => dispatch(setSafe(!safe))} />
					{/* </div> */}
				</div>

				<FilterBar onRefresh={refresh} disabled={disabled} />

				{data && data.total_pages > 1 && (
					<PaginationControls
						totalPages={data.total_pages}
						totalItems={data.total_count}
						onPageClick={handlePageChange}
						onPageSizeChange={handlePageSizeChange}
						disabled={disabled}
					/>
				)}
			</div>

			<NftProvider
				loading={isLoading}
				items={data?.nfts || []}
				safe={safe}
			>
				{(nft) => (
					<Nft
						key={nft.arweave_id}
						id={nft.arweave_id}
						action={
							nft.owner !== user?.principal ? <Purchase nft={nft} /> : <>
								<Remove nft={nft} />
								<Update nft={nft}/>
							</>
						}
						price={nft.price}
						// canister={canisters[nft.owner]}
					/>
				)}
			</NftProvider>

		</div>
	);
};

export default EmporiumPage;
