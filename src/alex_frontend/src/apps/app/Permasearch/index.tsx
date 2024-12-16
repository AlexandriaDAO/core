import React from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();

	return (
		<SearchContainer
			title="Permasearch"
			description="Search for any asset on Arweave."
			hint="Save them as NFTs."
			onSearch={handleSearch}
			isLoading={isLoading}
			topComponent={<ArweaveOwnerSelector />}
			filterComponent={<SearchForm />}
		/>
	);
}

export default Permasearch;


