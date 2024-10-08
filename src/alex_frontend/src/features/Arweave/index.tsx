import React, { useState } from 'react';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import SearchForm from './SearchForm';

// Define the state type
interface ArweaveState {
  contentCategory: string;
  isLoading: boolean;
  searchResults: any[]; // Replace 'any' with a more specific type if you have one
}

// Create the slice
const arweaveSlice = createSlice({
  name: 'arweave',
  initialState: {
    contentCategory: 'image',
    isLoading: false,
    searchResults: [],
  } as ArweaveState,
  reducers: {
    setContentCategory: (state, action: PayloadAction<string>) => {
      state.contentCategory = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
  },
});

// Export actions
export const { setContentCategory, setIsLoading, setSearchResults } = arweaveSlice.actions;

// Export reducer
export const arweaveReducer = arweaveSlice.reducer;

// Main component
const ArweaveSearch: React.FC = () => {
  const [contentCategory, setContentCategory] = useState('image');
  const [isLoading, setIsLoading] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [amount, setAmount] = useState(10);
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [contentType, setContentType] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    // Implement your search logic here
    // For example:
    // const results = await searchArweave(contentCategory, amount, filterDate, filterTime, ownerFilter, contentType);
    // setSearchResults(results);
    setIsLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Arweave Search</h1>
      <SearchForm
        contentCategory={contentCategory}
        setContentCategory={setContentCategory}
        advancedOptionsOpen={advancedOptionsOpen}
        setAdvancedOptionsOpen={setAdvancedOptionsOpen}
        amount={amount}
        setAmount={setAmount}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterTime={filterTime}
        setFilterTime={setFilterTime}
        ownerFilter={ownerFilter}
        setOwnerFilter={setOwnerFilter}
        contentType={contentType}
        setContentType={setContentType}
        mode="general"
        isLoading={isLoading}
        handleSearch={handleSearch}
      />
      {/* Add a component to display search results here */}
    </div>
  );
};

export default ArweaveSearch;