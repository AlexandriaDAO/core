import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

const DateSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleDateTimeChange = (type: 'date' | 'time', value: string) => {
    dispatch(setSearchState({ [type === 'date' ? 'filterDate' : 'filterTime']: value }));
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
  );
};

export default DateSelector;
