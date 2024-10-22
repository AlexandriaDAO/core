import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from './redux/arweaveThunks';
import SearchForm from './components/Search/SearchForm';
import ContentList from './components/ContentList';

const ArweaveFeature: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const searchState = useSelector((state: RootState) => state.arweave.searchState);
	const transactions = useSelector((state: RootState) => state.arweave.transactions);
	const searchFormOptions = useSelector((state: RootState) => state.arweave.searchFormOptions);

	const handleSearch = async () => {
		await dispatch(performSearch({ searchState }));
	};

	return (
		<div>
			<SearchForm 
				onSearch={handleSearch} 
				showNftOwners={searchFormOptions.showNftOwners}
				showContentCategory={searchFormOptions.showContentCategory}
				showAdvancedOptions={searchFormOptions.showAdvancedOptions}
				showNsfwModelControl={searchFormOptions.showNsfwModelControl}
			/>
			<ContentList 
				transactions={transactions} 
				onSelectContent={() => {}}			
			/>
		</div>
	);
};

export default ArweaveFeature;
