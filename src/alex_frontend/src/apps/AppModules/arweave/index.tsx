import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from './redux/arweaveThunks';
import SearchForm from './components/Search/SearchForm';
import ContentList from './components/Display/ContentList';

const ArweaveFeature: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const searchState = useSelector((state: RootState) => state.arweave.searchState);
	const transactions = useSelector((state: RootState) => state.arweave.transactions);

	const handleSearch = async () => {
		await dispatch(performSearch({ searchState }));
	};

	return (
		<div>
			<SearchForm 
				onSearch={handleSearch} 
			/>
			<ContentList 
				transactions={transactions} 
				onSelectContent={() => {}}			
			/>
		</div>
	);
};

export default ArweaveFeature;
