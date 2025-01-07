import React, { useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';

function Alexandrian() {
	useWiper();
	const dispatch = useDispatch<AppDispatch>();
	
	const isLoading = useSelector(
		useCallback((state: RootState) => state.library.isLoading, [])
	);

	const handleSearch = useCallback(async () => {
		try {
			await dispatch(performSearch({ start: 0, end: 20 }));
		} catch (error) {
			console.error('Search failed:', error);
		}
	}, [dispatch]);

	return (
		<SearchContainer
			title="Alexandrian"
			description="Search the NFT Library of others, and manage your own."
			onSearch={handleSearch}
			isLoading={isLoading}
			topComponent={<TopupBalanceWarning />}
			filterComponent={<Library />}
			showMoreEnabled={false}
		/>
	);
}

export default React.memo(Alexandrian);
