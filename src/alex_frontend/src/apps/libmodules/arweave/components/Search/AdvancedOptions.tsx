import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { supportedFileTypes, fileTypeCategories } from '../../types/files';
import { setSearchState } from '../../redux/arweaveSlice';

const AdvancedOptions: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleSearchStateChange = (key: string, value: any) => {
    dispatch(setSearchState({ [key]: value }));
  };

  // Filter content types based on the selected category
  const filteredContentTypes = useMemo(() => {
    if (searchState.contentCategory === 'all') {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[searchState.contentCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [searchState.contentCategory]);

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

  return (
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
  );
};

export default AdvancedOptions;
