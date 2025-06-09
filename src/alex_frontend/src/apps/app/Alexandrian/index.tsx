import React, { useCallback, useRef } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import { AlexandrianLibrary } from "@/apps/Modules/LibModules/nftSearch";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { toast } from 'sonner';
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearAllTransactions } from '@/apps/Modules/shared/state/transactions/transactionThunks';
import { useAssetManager } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

function Alexandrian() {
	const {actor: assetManagerActor} = useAssetManager();
	const dispatch = useAppDispatch();
	const { isLoading, searchParams } = useAppSelector(state => state.library);
	const transactions = useAppSelector(state => state.transactions.transactions);
	const nfts = useAppSelector(state => state.nftData.nfts);
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
		if(!assetManagerActor) return;
		try {
			// Only reset search if no assets have been loaded
			if (!assetsLoadedRef.current) {
				await dispatch(resetSearch());
			}
			await dispatch(performSearch({actor: assetManagerActor}));
		} catch (error) {
			handleSearchError(error, 'Search failed');
		}
	}, [dispatch, handleSearchError, assetManagerActor]);

	const handleShowMore = useCallback(async () => {
		if(!assetManagerActor) return;
		try {
			const newStart = searchParams.end;
			const newEnd = newStart + searchParams.pageSize;
			// Update pagination parameters without triggering a search
			await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
			// Perform the search directly without relying on useEffect
			await dispatch(performSearch({actor: assetManagerActor}));
		} catch (error) {
			handleSearchError(error, 'Failed to load more results');
		}
	}, [dispatch, searchParams, handleSearchError, assetManagerActor]);

	const handleCancelSearch = useCallback(() => {
		dispatch(resetSearch());
		dispatch(clearNfts());
		dispatch(clearAllTransactions());
		toast.info("Search cancelled");
	}, [dispatch]);

	{/* Asset Manager has been moved to the Dashboard */}
	return (
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
	);
}

export default React.memo(Alexandrian);