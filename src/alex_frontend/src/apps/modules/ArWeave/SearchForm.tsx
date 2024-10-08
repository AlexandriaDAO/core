import React from "react";
import { supportedFileTypes, fileTypeCategories } from "./types/files";

interface SearchFormProps {
  contentCategory: string;
  setContentCategory: (category: string) => void;
  advancedOptionsOpen: boolean;
  setAdvancedOptionsOpen: (open: boolean) => void;
  amount: number;
  setAmount: (amount: number) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  filterTime: string;
  setFilterTime: (time: string) => void;
  ownerFilter: string;
  setOwnerFilter: (owner: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  mode: 'user' | 'general';
  isLoading: boolean;
  handleSearch: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  contentCategory,
  setContentCategory,
  advancedOptionsOpen,
  setAdvancedOptionsOpen,
  amount,
  setAmount,
  filterDate,
  setFilterDate,
  filterTime,
  setFilterTime,
  ownerFilter,
  setOwnerFilter,
  contentType,
  setContentType,
  mode,
  isLoading,
  handleSearch,
}) => {
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
            value={contentCategory} 
            onChange={(e) => setContentCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none 
                       focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {Object.keys(fileTypeCategories).map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          className="mt-2 text-sm text-indigo-600 hover:underline"
        >
          {advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {/* Advanced Options */}
        {advancedOptionsOpen && (
          <div className="space-y-4">
            {/* Amount Slider */}
            {mode === 'general' && (
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount: <span className="font-semibold">{amount}</span>
                </label>
                <input 
                  id="amount"
                  type="range" 
                  value={amount} 
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="mt-1 w-full"
                />
              </div>
            )}

            {/* Date and Time Side by Side */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date:
                </label>
                <input
                  id="filterDate"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none 
                             focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="filterTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Time:
                </label>
                <input
                  id="filterTime"
                  type="time"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none 
                             focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>

            {/* Owner Address */}
            {mode === 'general' && (
              <div>
                <label htmlFor="ownerFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Address:
                </label>
                <input
                  id="ownerFilter"
                  type="text"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  placeholder="Enter owner address"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none
                             focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            )}

            {/* Content Type Selector in Advanced Options */}
            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                Content Type:
              </label>
              <select
                id="contentType"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none 
                           focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select File Type</option>
                {supportedFileTypes.map(type => (
                  <option key={type.mimeType} value={type.mimeType}>{type.displayName}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button 
          onClick={handleSearch} 
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                      text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
          disabled={isLoading}
        >
          {isLoading
            ? 'Loading...'
            : mode === 'user'
              ? 'Filter'
              : advancedOptionsOpen
                ? 'Search'
                : 'Random'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(SearchForm);