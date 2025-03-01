import React, { useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { toast } from 'sonner';
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearTransactions, clearContentData } from '@/apps/Modules/shared/state/content/contentDisplaySlice';

function Alexandrian() {
	useWiper();
	const dispatch = useDispatch<AppDispatch>();

	const { isLoading, searchParams } = useSelector((state: RootState) => state.library);

	const handleSearch = useCallback(async () => {
		try {
			await dispatch(resetSearch());
			await dispatch(performSearch());
		} catch (error) {
			console.error('Search failed:', error);
			toast.error('Search failed');
		}
	}, [dispatch]);

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
		dispatch(clearTransactions());
		dispatch(clearContentData());
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
				filterComponent={<Library />}
				showMoreEnabled={true}
				dataSource="nftTransactions"
			/>
			
		</>
	);
}

export default React.memo(Alexandrian);