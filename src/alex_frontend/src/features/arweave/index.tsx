import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { performSearch } from './redux/arweaveThunks';
import SearchForm from './components/SearchForm';
import ContentList from './components/ContentList';
import ContentRenderer from './components/ContentRenderer';

const ArweaveFeature: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const searchState = useSelector((state: RootState) => state.arweave.searchState);
	const transactions = useSelector((state: RootState) => state.arweave.transactions);
	const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);

	const handleSearch = async () => {
		await dispatch(performSearch({ searchState }));
	};

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent({ id, type });
	};

	return (
		<div>
			<SearchForm onSearch={handleSearch} />
			<ContentList 
				transactions={transactions} 
				onSelectContent={handleSelectContent}
			/>
			{selectedContent && (
				<ContentRenderer 
					contentId={selectedContent.id} 
					contentType={selectedContent.type}
				/>
			)}
		</div>
	);
};

export default ArweaveFeature;