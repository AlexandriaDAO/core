import React, { useCallback, useEffect, useRef } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import { AlexandrianLibrary } from "@/apps/Modules/LibModules/nftSearch";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { toast } from 'sonner';
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearAllTransactions } from '@/apps/Modules/shared/state/transactions/transactionThunks';

function Alexandrian() {
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, searchParams, selectedPrincipals } = useSelector((state: RootState) => state.library);
	const transactions = useSelector((state: RootState) => state.transactions.transactions);
	const nfts = useSelector((state: RootState) => state.nftData.nfts);
	const { user } = useSelector((state: RootState) => state.auth);
	// Track if assets have been loaded to prevent state wiping
	const assetsLoadedRef = useRef(false);

	// Update ref when assets are loaded
	const hasAssets = transactions.length > 0 || Object.keys(nfts).length > 0;
	if (hasAssets && !isLoading && !assetsLoadedRef.current) {
		assetsLoadedRef.current = true;
	}

	// Error handler for search operations
	const handleSearchError = useCallback((error: any, message: string) => {
		console.error(`${message}:`, error);
		toast.error(message);
	}, []);

	const handleSearch = useCallback(async () => {
		try {
			// Only reset search if no assets have been loaded
			if (!assetsLoadedRef.current) {
				await dispatch(resetSearch());
			}
			await dispatch(performSearch());
		} catch (error) {
			handleSearchError(error, 'Search failed');
		}
	}, [dispatch, handleSearchError]);

	const handleShowMore = useCallback(async () => {
		try {
			const newStart = searchParams.end;
			const newEnd = newStart + searchParams.pageSize;
			// Update pagination parameters without triggering a search
			await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
			// Perform the search directly without relying on useEffect
			await dispatch(performSearch());
		} catch (error) {
			handleSearchError(error, 'Failed to load more results');
		}
	}, [dispatch, searchParams, handleSearchError]);

	const handleCancelSearch = useCallback(() => {
		dispatch(resetSearch());
		dispatch(clearNfts());
		dispatch(clearAllTransactions());
		toast.info("Search cancelled");
	}, [dispatch]);
	
	return (
		<>
			{/* Asset Manager has been moved to the Dashboard */}
			<SearchContainer
				title="Alexandrian"
				description="Search the NFT Library of others, and manage your own."
				hint="Likes cost 10 LBRY (5 burned | 5 to the creator)."
				onSearch={handleSearch}
				onShowMore={handleShowMore}
				onCancel={handleCancelSearch}
				isLoading={isLoading}
				topComponent={<TopupBalanceWarning />}
				filterComponent={
					<AlexandrianLibrary
						defaultCategory="all"
						defaultPrincipal="new"
						showPrincipalSelector={true}
						showCollectionSelector={true}
						showTagsSelector={true}
					/>
				}
				showMoreEnabled={true}
				dataSource="transactions"
				preserveState={assetsLoadedRef.current}
			/>
		</>
	);
}

export default React.memo(Alexandrian);