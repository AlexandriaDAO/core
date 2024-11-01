import React from "react";
import { SearchFormProps } from '@/apps/Modules/shared/types/queries';
import { useHandleSearch } from './hooks/useSearchHandlers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';

import NsfwModelControl from './NsfwSelector';
import AmountSelector from './selectors/AmountSelector';
import ContentCategorySelector from './selectors/ContentCategorySelector';
import DateSelector from './selectors/DateSelector';
import ArweaveOwnerSelector from './selectors/ArweaveOwnerSelector';
import ContentTagsSelector from './selectors/ContentTagsSelector';

const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch,
}) => {
  const { isLoading } = useHandleSearch();
  const dispatch = useDispatch<AppDispatch>();

  const handleSearchClick = async () => {
    await dispatch(wipe());
    onSearch();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm">
      <div className="space-y-4">

        <ContentCategorySelector />
        <AmountSelector />
        <DateSelector />
        <ArweaveOwnerSelector />
        <ContentTagsSelector />
        <NsfwModelControl />
        
        {/* Updated Search Button */}
        <button 
          onClick={handleSearchClick} 
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
