import React, { useState, useCallback } from "react";
import { Transaction } from "./types/queries";
import { supportedFileTypes, fileTypeCategories } from "./types/files";
import { fetchRecentTransactions, fetchTransactionsByIds } from "./ArweaveQueries";

interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}

export default function Search({ 
  onTransactionsUpdate, 
  onLoadingChange,
  mode,
  userTransactionIds = []
}: SearchProps) {
  const [contentType, setContentType] = useState<string>("");
  const [amount, setAmount] = useState<number>(12);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("00:00");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [minBlock, setMinBlock] = useState<number | undefined>();
  const [maxBlock, setMaxBlock] = useState<number | undefined>();

  // Add state for content category and advanced options
  const [contentCategory, setContentCategory] = useState<string>("images");
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState<boolean>(false);

  const handleSearch = useCallback(async () => {
    if (!advancedOptionsOpen) {
      // Generate random date and time when advanced options are closed
      const startTimestamp = new Date('2019-06-01').getTime() / 1000;
      const endTimestamp = Date.now() / 1000;
      const randomTimestamp = Math.floor(Math.random() * (endTimestamp - startTimestamp) + startTimestamp);

      const randomDate = new Date(randomTimestamp * 1000);
      const dateString = randomDate.toISOString().substr(0, 10);
      const timeString = randomDate.toISOString().substr(11, 5);

      setFilterDate(dateString);
      setFilterTime(timeString);
    }

    setIsLoading(true);
    onLoadingChange(true);

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let contentTypes: string[] = [];

      if (advancedOptionsOpen && contentType) {
        contentTypes = [contentType];
      } else if (contentCategory && contentCategory !== "") {
        contentTypes = fileTypeCategories[contentCategory] || [];
      }

      let fetchedTransactions: Transaction[];

      if (mode === "user") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds,
          contentTypes,
          maxTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          contentTypes,
          amount,
          maxTimestamp,
          ownerFilter || undefined,
          minBlock,
          maxBlock
        );
      }

      console.log("Fetched transactions:", fetchedTransactions);
      onTransactionsUpdate(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [
    contentType,
    contentCategory,
    advancedOptionsOpen,
    amount,
    filterDate,
    filterTime,
    ownerFilter,
    mode,
    userTransactionIds,
    onTransactionsUpdate,
    onLoadingChange,
    minBlock,
    maxBlock,
  ]);

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
            <option value="images">Images</option>
            <option value="books">Books</option>
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
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
}