import React, { useEffect, useCallback, useState } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import { toast } from 'sonner';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useWiper, wipe } from '@/apps/Modules/shared/state/wiper';
import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';
import { setIsLoading } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();
	const dispatch = useAppDispatch();
	const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
	const lastCursor = useSelector((state: RootState) => state.arweave.lastCursor);
	const [modelLoading, setModelLoading] = useState(false);
	useWiper();

	useEffect(() => {
		dispatch(setTransactions([])); //clear data from emporium 
		
		// Preload TensorFlow when component mounts
		setModelLoading(true);
		nsfwService.loadModel()
			.then(() => {
				setModelLoading(false);
			})
			.catch(error => {
				console.error('Failed to preload TensorFlow:', error);
				setModelLoading(false);
			});

		return () => {
			// Cleanup when component unmounts
			nsfwService.unloadModel();
		};
	}, []);

	const handleNewSearch = useCallback(async () => {
		try {
			// Use the wipe thunk to clear all relevant state
			await dispatch(wipe());
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
			return handleSearch(lastTransaction.block?.timestamp, 50, lastCursor || undefined).catch(error => {
				toast.error(error.message || "An error occurred while loading more results");
			});
		}
	};

	const handleCancelSearch = useCallback(() => {
		// First stop the loading state
		dispatch(setIsLoading(false));
		
		// Use the wipe thunk to clear all relevant state
		dispatch(wipe());
		
		toast.info("Search cancelled");
	}, [dispatch]);

	return (
		<SearchContainer
			title="Permasearch"
			description="Search for Arweave assets. Save them as NFTs."
			hint={modelLoading ? "Loading content safety model..." : "Minting costs 10 LBRY (this will decrease over time)."}
			onSearch={handleNewSearch}
			onShowMore={handleShowMore}
			onCancel={handleCancelSearch}
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


