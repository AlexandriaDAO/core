import React, { useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';

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

	return (
		<SearchContainer
			title="Alexandrian"
			description="Search the NFT Library of others, and manage your own."
			hint="Liking costs 20 LBRY (this will decrease over time)."
			onSearch={handleSearch}
			onShowMore={handleShowMore}
			isLoading={isLoading}
			topComponent={<TopupBalanceWarning />}
			filterComponent={<Library />}
			showMoreEnabled={true}
			// useNsfw={false}
		/>
	);
}

export default React.memo(Alexandrian);
