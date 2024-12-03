import React from 'react';
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';

const ArweaveFeature: React.FC = () => {

	return (
		<>
			<ArweaveOwnerSelector />
			<SearchForm />
		</>
	);
};

export default ArweaveFeature;
