import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from './redux/arweaveThunks';
import SearchForm from './components/Search/SearchForm';

const ArweaveFeature: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const searchState = useSelector((state: RootState) => state.arweave.searchState);

	const handleSearch = async () => {
		await dispatch(performSearch({ searchState }));
	};

	return (
		<div>
			<SearchForm 
				onSearch={handleSearch} 
			/>
		</div>
	);
};

export default ArweaveFeature;
