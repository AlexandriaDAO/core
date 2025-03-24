import React, { useEffect, useCallback, useState } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import { toast } from 'sonner';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTransactions } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useWiper, wipe } from '@/apps/Modules/shared/state/wiper';
import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';
import { setIsLoading } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import TensorFlowPreloader from '@/apps/Modules/shared/components/TensorFlowPreloader';

function Permasearch() {
	const { isLoading, handleSearch } = useHandleSearch();
	const dispatch = useAppDispatch();
	const transactions = useSelector((state: RootState) => state.transactions.transactions);
	const lastCursor = useSelector((state: RootState) => state.arweave.lastCursor);
	const [modelLoading, setModelLoading] = useState(false);
	const [modelLoadFailed, setModelLoadFailed] = useState(false);
	useWiper();

	// Clear transactions when component mounts
	useEffect(() => {
		console.log('Permasearch component mounted, clearing transactions');
		dispatch(setTransactions([])); //clear data from emporium 
		
		// Cleanup when component unmounts
		return () => {
			console.log('Permasearch component unmounting, unloading model');
			nsfwService.unloadModel();
		};
	}, [dispatch]);

	// Handle TensorFlow loaded event
	const handleTensorFlowLoaded = useCallback(async () => {
		console.log('TensorFlow loaded, loading NSFW model');
		try {
			setModelLoading(true);
			setModelLoadFailed(false);
			
			// Load the NSFW model
			const success = await nsfwService.loadModel();
			
			if (success) {
				console.log('NSFW model loaded successfully');
				setModelLoading(false);
			} else {
				throw new Error('Failed to load NSFW model');
			}
		} catch (error) {
			console.error('Failed to load NSFW model:', error);
			setModelLoading(false);
			setModelLoadFailed(true);
			
			// Show error toast only once
			toast.error('Failed to load content filter. Some images may not be properly filtered.', {
				id: 'nsfw-model-load-error',
				duration: 5000
			});
		}
	}, []);

	// Handle TensorFlow loading error
	const handleTensorFlowError = useCallback((error: Error) => {
		console.error('Failed to load TensorFlow after retries:', error);
		setModelLoading(false);
		setModelLoadFailed(true);
		
		// Show error toast only once
		toast.error('Failed to load content filter. Some images may not be properly filtered.', {
			id: 'nsfw-model-load-error',
			duration: 5000
		});
	}, []);

	// Handle new search
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

	// Handle show more
	const handleShowMore = useCallback(() => {
		if (transactions.length > 0) {
			const lastTransaction = transactions[transactions.length - 1];
			return handleSearch(lastTransaction.block?.timestamp, 50, lastCursor || undefined).catch(error => {
				toast.error(error.message || "An error occurred while loading more results");
			});
		}
	}, [transactions, handleSearch, lastCursor]);

	// Handle cancel search
	const handleCancelSearch = useCallback(() => {
		// First stop the loading state
		dispatch(setIsLoading(false));
		
		// Use the wipe thunk to clear all relevant state
		dispatch(wipe());
		
		toast.info("Search cancelled");
	}, [dispatch]);

	return (
		<>
			{/* TensorFlow Preloader with increased retries and delay */}
			<TensorFlowPreloader 
				onLoaded={handleTensorFlowLoaded} 
				onError={handleTensorFlowError}
				maxRetries={5}
				retryDelay={2000}
			/>
			<SearchContainer
				title="Permasearch"
				description="Search for Arweave assets. Save them as NFTs."
				hint={
					modelLoading 
						? "Loading content safety model..." 
						: modelLoadFailed 
							? "Content safety model failed to load. Some images may not be filtered." 
							: "Each mint burns 5 LBRY."
				}
				onSearch={handleNewSearch}
				onShowMore={handleShowMore}
				onCancel={handleCancelSearch}
				isLoading={isLoading || modelLoading}
				topComponent={
					<TopupBalanceWarning />
				}
				filterComponent={
					<>
						<ArweaveOwnerSelector />
						<div className="mt-6 md:mt-8">
							<SearchForm />
						</div>
					</>
				}
				showMoreEnabled={true}
				dataSource="transactions"
				// useNsfw={true}
			/>
		</>
	);
}

export default Permasearch;


