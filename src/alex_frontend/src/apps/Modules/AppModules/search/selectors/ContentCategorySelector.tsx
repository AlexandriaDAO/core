import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fileTypeCategories } from '@/apps/Modules/shared/types/files';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

const ContentCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const { contentCategory } = useSelector((state: RootState) => state.arweave.searchState);

  const handleCategoryChange = (value: string) => {
    dispatch(setSearchState({ contentCategory: value }));
  };

  return (
    <div className="flex flex-col justify-center items-start gap-3 w-full">
      <label 
        htmlFor="contentCategory" 
        className="text-black font-syne text-xl font-semibold"
      >
        Content Category
      </label>
      
      <div className="relative w-full">
        <select 
          id="contentCategory"
          value={contentCategory} 
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full h-[50px] px-5 py-4 rounded-[30px] border border-[#F3F3F3] bg-white
                   text-black font-syne text-base font-normal appearance-none"
        >
          <option value="favorites">Popular</option>
          {Object.keys(fileTypeCategories)
            .filter(category => category !== 'favorites')
            .map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
          ))}
        </select>
        
        <div className="absolute right-[22px] top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8721 4.25939C15.8721 4.12502 15.8189 3.9875 15.7158 3.88437C15.5096 3.67812 15.1721 3.67812 14.9658 3.88437L7.90645 10.9437L0.950195 3.9875C0.743945 3.78125 0.406446 3.78125 0.200195 3.9875C-0.00605488 4.19375 -0.00605488 4.53125 0.200195 4.7375L7.53145 12.0719C7.7377 12.2781 8.0752 12.2781 8.28145 12.0719L15.7158 4.6375C15.8221 4.53125 15.8721 4.39689 15.8721 4.25939Z" fill="black"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ContentCategorySelector;
