import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fileTypeCategories } from '../../types/files';
import { setSearchState } from '../../redux/arweaveSlice';

const ContentCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const { contentCategory } = useSelector((state: RootState) => state.arweave.searchState);

  const handleCategoryChange = (value: string) => {
    dispatch(setSearchState({ contentCategory: value }));
  };

  return (
    <div>
      <label htmlFor="contentCategory" className="block text-sm font-medium text-gray-700 mb-1">
        Content Category:
      </label>
      <select 
        id="contentCategory"
        value={contentCategory} 
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none 
                   focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="favorites">Favorites</option>
        {Object.keys(fileTypeCategories).filter(category => category !== 'favorites').map((category) => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ContentCategorySelector;
