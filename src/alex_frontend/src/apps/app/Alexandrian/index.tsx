import React, { useCallback, useRef } from "react";
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

/**
 * Custom hook to track asset loading state and prevent state wiping
 * when assets have been successfully loaded.
 */
const useAssetLoadingState = () => {
	// Use ref to keep track of loading state without causing re-renders
	const assetsLoadedRef = useRef(false);
	
	// Select required state
	const { isLoading } = useSelector((state: RootState) => state.library);
	const transactions = useSelector((state: RootState) => state.transactions.transactions);
	const nfts = useSelector((state: RootState) => state.nftData.nfts);
	
	// Consider assets loaded if we have transactions OR NFTs, and we're not currently loading
	const hasTransactions = transactions.length > 0;
	const hasNfts = Object.keys(nfts).length > 0;
	
	// Set ref to true when assets have loaded
	if ((hasTransactions || hasNfts) && !isLoading && !assetsLoadedRef.current) {
		console.log('Assets loaded, preserving state');
		assetsLoadedRef.current = true;
	}
	
	return assetsLoadedRef.current;
};

function Alexandrian() {
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, searchParams } = useSelector((state: RootState) => state.library);
	
	// Track asset loading state to prevent state wiping 
	const assetsLoaded = useAssetLoadingState();

	const handleSearch = useCallback(async () => {
		try {
			// Only reset search if no assets have been loaded
			// This prevents wiping out state when assets are already present
			if (!assetsLoaded) {
				await dispatch(resetSearch());
			}
			await dispatch(performSearch());
		} catch (error) {
			console.error('Search failed:', error);
			toast.error('Search failed');
		}
	}, [dispatch, assetsLoaded]);

	const handleShowMore = useCallback(async () => {
		try {
			const newStart = searchParams.end;
			const newEnd = newStart + searchParams.pageSize;
			await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
			await dispatch(performSearch());
		} catch (error) {
			console.error('Failed to load more results:', error);
			toast.error('Failed to load more results');
		}
	}, [dispatch, searchParams]);

	const handleCancelSearch = useCallback(() => {
		dispatch(resetSearch());
		dispatch(clearNfts());
		dispatch(clearAllTransactions());
		toast.info("Search cancelled");
	}, [dispatch]);

	return (
		<>
		  <div className="rounded-lg">
				{/* <AssetManager /> */}
			</div>
			<SearchContainer
				title="Alexandrian"
				description="Search the NFT Library of others, and manage your own."
				hint="Liking costs 20 LBRY (this will decrease over time)."
				onSearch={handleSearch}
				onShowMore={handleShowMore}
				onCancel={handleCancelSearch}
				isLoading={isLoading}
				topComponent={<TopupBalanceWarning />}
				filterComponent={<AlexandrianLibrary />}
				showMoreEnabled={true}
				dataSource="transactions"
				preserveState={assetsLoaded}
			/>
			
		</>
	);
}

export default React.memo(Alexandrian);