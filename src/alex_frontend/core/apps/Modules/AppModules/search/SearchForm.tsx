import React from "react";
import NsfwModelControl from './NsfwSelector';
import AmountSelector from './selectors/AmountSelector';
import ContentCategorySelector from './selectors/ContentCategorySelector';
import DateSelector from './selectors/DateSelector';
import ContentTagsSelector from './selectors/ContentTagsSelector';
import { useTheme } from '@/providers/ThemeProvider';

const SearchForm: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex flex-col w-full max-w-[800px] p-3 md:p-5 gap-5 md:gap-10 items-start rounded-[16px] md:rounded-[20px] border ${isDark ? 'border-border bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <div className="flex flex-col gap-4 w-full sm:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-1/2">
              <AmountSelector />
            </div>
            <div className="w-full sm:w-1/2">
              <ContentCategorySelector />
            </div>
          </div>
          <NsfwModelControl />
        </div>
        <div className="w-full sm:w-1/2">
          <ContentTagsSelector />
        </div>
      </div>
      <DateSelector />
    </div>
  );
};

export default React.memo(SearchForm);
