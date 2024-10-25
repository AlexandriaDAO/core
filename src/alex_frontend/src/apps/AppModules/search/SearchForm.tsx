import React from "react";
import { SearchFormProps } from '@/apps/LibModules/arweaveSearch/types/queries';
import { useHandleSearch } from '@/apps/LibModules/arweaveSearch/hooks/useSearchHandlers';

import AmountSelector from './AmountSelector';
import ContentCategorySelector from './ContentCategorySelector';
import NsfwModelControl from '@/apps/LibModules/arweaveSearch/components/nsfwjs/NsfwModelControl';
import DateSelector from './DateSelector';
import ArweaveOwnerSelector from './ArweaveOwnerSelector';
import ContentTagsSelector from './ContentTagsSelector';


const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch,
}) => {
  const { isLoading } = useHandleSearch();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm">
      <div className="space-y-4">

        <ContentCategorySelector />
        <AmountSelector />
        <DateSelector />
        <ArweaveOwnerSelector />
        <ContentTagsSelector />
        <NsfwModelControl />
        
        {/* Search Button */}
        <button 
          onClick={onSearch} 
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                      text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchForm);
