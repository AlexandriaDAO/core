import React from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import { toast } from 'sonner';

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();

	return (
		<SearchContainer
			title="Permasearch"
			description="Search for any asset on Arweave."
			hint="Save them as NFTs."
			onSearch={() => handleSearch().catch(error => {
				toast.error(error.message || "An error occurred while searching");
			})}
			isLoading={isLoading}
			topComponent={<ArweaveOwnerSelector />}
			filterComponent={<SearchForm />}
		/>
	);
}

export default Permasearch;


