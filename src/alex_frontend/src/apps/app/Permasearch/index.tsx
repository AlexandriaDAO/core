import React, { useEffect, useCallback } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import { toast } from 'sonner';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTransactions, clearTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useWiper } from '@/apps/Modules/shared/state/wiper';
import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();
	const dispatch = useAppDispatch();
	const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
	useWiper();

	useEffect(() => {
		dispatch(setTransactions([])); //clear data from emporium 
		
		// Preload TensorFlow when component mounts
		nsfwService.loadModel().catch(error => {
			console.error('Failed to preload TensorFlow:', error);
		});

		return () => {
			// Cleanup when component unmounts
			nsfwService.unloadModel();
		};
	}, []);

	const handleNewSearch = useCallback(async () => {
		try {
			await dispatch(clearTransactions());
			return handleSearch().catch(error => {
				toast.error(error.message || "An error occurred while searching");
			});
		} catch (error) {
			console.error('Search failed:', error);
		}
	}, [dispatch, handleSearch]);

	const handleShowMore = () => {
		if (transactions.length > 0) {
			const lastTransaction = transactions[transactions.length - 1];
			const lastTimestamp = lastTransaction.block?.timestamp;
			return handleSearch(lastTimestamp).catch(error => {
				toast.error(error.message || "An error occurred while loading more results");
			});
		}
	};

	return (
		<SearchContainer
			title="Permasearch"
			description="Search for Arweave assets. Save them as NFTs."
			hint="Minting costs 10 LBRY (this will decrease over time)."
			onSearch={handleNewSearch}
			onShowMore={handleShowMore}
			isLoading={isLoading}
			topComponent={
				<>
					<TopupBalanceWarning />
					<ArweaveOwnerSelector />
				</>
			}
			filterComponent={<SearchForm />}
			showMoreEnabled={true}
			// useNsfw={true}
		/>
	);
}

export default Permasearch;


