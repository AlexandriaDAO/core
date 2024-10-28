import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from '@/apps/Modules/shared/state/arweave/arweaveThunks';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';

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
