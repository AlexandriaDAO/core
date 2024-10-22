import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SearchFormProps } from "../../types/queries";
import { useHandleSearch } from '../../hooks/useSearchHandlers';
import { RootState } from '@/store';
import { setSearchState } from '../../redux/arweaveSlice';


import NftOwnerSelector from './NftOwnerSelector';
import ContentCategorySelector from './ContentCategorySelector';
import AdvancedOptions from './AdvancedOptions';
import NsfwModelControl from './NsfwModelControl';

interface SearchFormOptions {
  showNftOwners?: boolean;
  showContentCategory?: boolean;
  showAdvancedOptions?: boolean;
  showNsfwModelControl?: boolean;
}

const SearchForm: React.FC<SearchFormProps & SearchFormOptions> = ({ 
  onSearch,
  showNftOwners = true,
  showContentCategory = true,
  showAdvancedOptions = true,
  showNsfwModelControl = true
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useHandleSearch();
  const { advancedOptionsOpen } = useSelector((state: RootState) => state.arweave.searchState);

  const toggleAdvancedOptions = () => {
    dispatch(setSearchState({ advancedOptionsOpen: !advancedOptionsOpen }));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm">
      <div className="space-y-4">
        {showNftOwners && <NftOwnerSelector />}

        {showContentCategory && <ContentCategorySelector />}

        {showAdvancedOptions && (
          <>
            <button
              onClick={toggleAdvancedOptions}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              {advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>

            {advancedOptionsOpen && <AdvancedOptions />}
          </>
        )}

        {showNsfwModelControl && <NsfwModelControl />}

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
