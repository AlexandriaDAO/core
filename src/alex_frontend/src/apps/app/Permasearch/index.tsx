import React, { useEffect } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import { toast } from 'sonner';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();
	const dispatch = useAppDispatch();
	useEffect(() => {
		dispatch(setTransactions([]));
	}, [])
	return (
		<SearchContainer
			title="Permasearch"
			description="Search for any asset on Arweave."
			hint="Save them as NFTs."
			onSearch={(continueFromTimestamp?: number) =>
				handleSearch(continueFromTimestamp).catch(error => {
					toast.error(error.message || "An error occurred while searching");
				})
			}
			isLoading={isLoading}
			topComponent={<ArweaveOwnerSelector />}
			filterComponent={<SearchForm />}
		/>
	);
}

export default Permasearch;


