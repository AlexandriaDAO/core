import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

const ArweaveOwnerSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleSearchStateChange = (value: string) => {
    dispatch(setSearchState({ ownerFilter: value }));
  };

  return (
    <div>
      <label htmlFor="ownerFilter" className="block text-sm font-medium text-gray-700 mb-1">
        Owner (ArWeave Uploader):
      </label>
      <input
        id="ownerFilter"
        type="text"
        value={searchState.ownerFilter}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="Enter owner address"
        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none
                   focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      />
    </div>
  );
};

export default ArweaveOwnerSelector;
