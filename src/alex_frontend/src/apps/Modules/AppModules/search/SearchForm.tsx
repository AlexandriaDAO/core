import React from "react";
import { SearchFormProps } from '@/apps/Modules/shared/types/queries';
import { useHandleSearch } from './hooks/useSearchHandlers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';
import { Button } from '@/lib/components/button';

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
    <div className="flex flex-col items-center w-full max-w-[440px] p-4 gap-10 rounded-[20px] border border-[#CCC] bg-white">
      <div className="w-full space-y-4">
        <ContentCategorySelector />
        <AmountSelector />
        <DateSelector />
        <ArweaveOwnerSelector />
        <ContentTagsSelector />
        <NsfwModelControl />
        
        <Button 
          onClick={handleSearchClick}
          disabled={isLoading}
          variant="primary"
          className="w-full"
        >
          {isLoading ? 'Loading...' : 'Search'}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(SearchForm);
