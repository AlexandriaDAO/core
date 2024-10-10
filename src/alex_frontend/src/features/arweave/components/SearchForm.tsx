import React, { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supportedFileTypes, fileTypeCategories } from "../types/files";
import { SearchFormProps } from "../types/queries";
import { useHandleSearch } from '../hooks/useSearchHandlers';
import { loadModel, isModelLoaded } from './ContentValidator';
import { setNsfwModelLoaded } from '../redux/arweaveSlice';
import { RootState } from '@/store';

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  const {
    searchState,
    isLoading,
    handleSearchStateChange,
  } = useHandleSearch();

  // Filter content types based on the selected category
  const filteredContentTypes = useMemo(() => {
    if (searchState.contentCategory === 'all') {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[searchState.contentCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [searchState.contentCategory]);

  // Select all tags of the current category by default
  useEffect(() => {
    const allCategoryTags = filteredContentTypes.map(type => type.mimeType);
    handleSearchStateChange('tags', allCategoryTags);
  }, [searchState.contentCategory, filteredContentTypes]);

  const handleTagToggle = (mimeType: string) => {
    const newTags = searchState.tags.includes(mimeType)
      ? searchState.tags.filter(tag => tag !== mimeType)
      : [...searchState.tags, mimeType];
    handleSearchStateChange('tags', newTags);
  };

  const handleDateTimeChange = (type: 'date' | 'time', value: string) => {
    handleSearchStateChange(type === 'date' ? 'filterDate' : 'filterTime', value);
  };

  const generateRandomDate = () => {
    const start = new Date('2019-06-01').getTime();
    const end = Date.now();
    const randomDate = new Date(start + Math.random() * (end - start));
    return randomDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const generateRandomTime = () => {
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleLoadNsfwModel = async () => {
    if (!isModelLoaded()) {
      setIsLoadingModel(true);
      try {
        await loadModel();
        dispatch(setNsfwModelLoaded(true));
      } catch (error) {
        console.error('Error loading NSFW model:', error);
      } finally {
        setIsLoadingModel(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm">
      <div className="space-y-4">
        {/* Content Category Selector */}
        <div>
          <label htmlFor="contentCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Content Category:
          </label>
          <select 
            id="contentCategory"
            value={searchState.contentCategory} 
            onChange={(e) => {
              handleSearchStateChange('contentCategory', e.target.value);
              handleSearchStateChange('tags', []); // Reset tags when category changes
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none 
                       focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            {Object.keys(fileTypeCategories).map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => handleSearchStateChange('advancedOptionsOpen', !searchState.advancedOptionsOpen)}
          className="mt-2 text-sm text-indigo-600 hover:underline"
        >
          {searchState.advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {/* Advanced Options */}
        {searchState.advancedOptionsOpen && (
          <div className="space-y-4">
            {/* Amount Slider */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount: <span className="font-semibold">{searchState.amount}</span>
              </label>
              <input 
                id="amount"
                type="range" 
                value={searchState.amount} 
                onChange={(e) => handleSearchStateChange('amount', parseInt(e.target.value))}
                min="1"
                max="100"
                className="mt-1 w-full"
              />
            </div>

            {/* Date and Time Side by Side */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date (UTC):
                </label>
                <div className="flex items-center">
                  <input
                    id="filterDate"
                    type="date"
                    value={searchState.filterDate}
                    onChange={(e) => handleDateTimeChange('date', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none 
                               focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                  <button
                    onClick={() => handleDateTimeChange('date', generateRandomDate())}
                    className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                    type="button"
                  >
                    🎲
                  </button>
                </div>
              </div>
              <div className="w-1/2">
                <label htmlFor="filterTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Time (UTC):
                </label>
                <div className="flex items-center">
                  <input
                    id="filterTime"
                    type="time"
                    value={searchState.filterTime}
                    onChange={(e) => handleDateTimeChange('time', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none 
                               focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                  <button
                    onClick={() => handleDateTimeChange('time', generateRandomTime())}
                    className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                    type="button"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>

            {/* Owner Address */}
            <div>
              <label htmlFor="ownerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Owner Address:
              </label>
              <input
                id="ownerFilter"
                type="text"
                value={searchState.ownerFilter}
                onChange={(e) => handleSearchStateChange('ownerFilter', e.target.value)}
                placeholder="Enter owner address"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none
                           focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>

            {/* Content Tags Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Tags:
              </label>
              <div className="mt-2 space-y-2">
                {filteredContentTypes.map(type => (
                  <label key={type.mimeType} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={searchState.tags.includes(type.mimeType)}
                      onChange={() => handleTagToggle(type.mimeType)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NSFW Model Status and Load Button */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            NSFW Model Status: {nsfwModelLoaded ? 'Loaded' : 'Not Loaded'}
          </span>
          <button
            onClick={handleLoadNsfwModel}
            disabled={nsfwModelLoaded || isLoadingModel}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md 
                        ${nsfwModelLoaded || isLoadingModel
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
          >
            {isLoadingModel ? 'Loading...' : 'Load NSFW Model'}
          </button>
        </div>

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