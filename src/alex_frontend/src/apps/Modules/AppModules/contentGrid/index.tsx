import React from 'react';
import ContentList from './ContentList';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const ContentDisplay: React.FC = () => {
	const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);

	return <ContentList 
		transactions={transactions}
	/>;
};

export default ContentDisplay;
