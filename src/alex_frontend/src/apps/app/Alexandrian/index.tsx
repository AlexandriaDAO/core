import React, { useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch, setLoading } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import AssetManager from "@/apps/Modules/shared/components/AssetManager";
import { toast } from 'sonner';
import { clearNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearTransactions, clearContentData } from '@/apps/Modules/shared/state/content/contentDisplaySlice';

function Alexandrian() {
	useWiper();
	const dispatch = useDispatch<AppDispatch>();

	const isLoading = useSelector((state: RootState) => state.library.isLoading);
	const searchParams = useSelector((state: RootState) => state.library.searchParams);

	const handleSearch = useCallback(async () => {
		try {
			await dispatch(resetSearch());
			await dispatch(performSearch());
		} catch (error) {
			console.error('Search failed:', error);
		}
	}, [dispatch]);

	const handleShowMore = useCallback(async () => {
		try {
			const newStart = searchParams.end;
			const newEnd = newStart + searchParams.pageSize;
			await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
		} catch (error) {
			console.error('Show more failed:', error);
		}
	}, [dispatch, searchParams]);

	const handleCancelSearch = useCallback(() => {
		// Stop loading state
		dispatch(setLoading(false));
		
		// Clear library search state
		dispatch(resetSearch());
		
		// Clear NFT data
		dispatch(clearNFTs());
		
		// Clear content display state
		dispatch(clearTransactions());
		dispatch(clearContentData());
		
		toast.info("Search cancelled");
	}, [dispatch]);

	return (
		<>
		  <div className="rounded-lg">
				<AssetManager />
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
				filterComponent={<Library />}
				showMoreEnabled={true}
			/>
			
		</>
	);
}

export default React.memo(Alexandrian);