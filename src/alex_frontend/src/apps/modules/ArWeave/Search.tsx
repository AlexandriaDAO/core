import React, { useState, useCallback } from "react";
import { Transaction } from "./types/queries";
import { supportedFileTypes } from "./types/files";
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
  const [amount, setAmount] = useState<number>(10);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("00:00");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [minBlock, setMinBlock] = useState<number | undefined>();
  const [maxBlock, setMaxBlock] = useState<number | undefined>();

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    onLoadingChange(true);

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let fetchedTransactions: Transaction[];

      if (mode === "user") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds,
          contentType,
          maxTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          contentType,
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
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">Content Type:</label>
          <select 
            id="contentType"
            value={contentType} 
            onChange={(e) => setContentType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Types</option>
            {supportedFileTypes.map(type => (
              <option key={type.mimeType} value={type.mimeType}>{type.displayName}</option>
            ))}
          </select>
        </div>
        {mode === 'general' && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount:</label>
            <input 
              id="amount"
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Math.min(parseInt(e.target.value), 100))}
              min="1"
              max="100"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        )}
        <div>
          <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
          <input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div>
          <label htmlFor="filterTime" className="block text-sm font-medium text-gray-700 mb-1">Time:</label>
          <input
            id="filterTime"
            type="time"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        {mode === 'general' && (
          <div>
            <label htmlFor="ownerFilter" className="block text-sm font-medium text-gray-700 mb-1">Owner Address:</label>
            <input
              id="ownerFilter"
              type="text"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              placeholder="Enter owner address"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        )}
        <button 
          onClick={handleSearch} 
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (mode === 'user' ? 'Filter' : 'Search')}
        </button>
      </div>
    </div>
  );
}