import React from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import Library from "@/apps/Modules/LibModules/nftSearch";
import { useWiper } from "@/apps/Modules/shared/state/wiper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';

function Alexandrian() {
	useWiper();
	const dispatch = useDispatch<AppDispatch>();
	const isLoading = useSelector((state: RootState) => state.library.isLoading);

	const handleSearch = async () => {
		await dispatch(performSearch({ start: 0, end: 20 }));
	};

	return (
		<SearchContainer
			title="Alexandrian"
			description="Search the NFT Library of others, and manage your own."
			onSearch={handleSearch}
			isLoading={isLoading}
			filterComponent={<Library />}
		/>
	);
}

export default Alexandrian;
