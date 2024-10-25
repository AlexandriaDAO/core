import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/LibModules/arweaveSearch/redux/arweaveSlice';

const AmountSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(event.target.value, 10);
    dispatch(setSearchState({ amount: newAmount }));
  };

  return (
    <div className="mt-4">
      <label htmlFor="amountSlider" className="block text-sm font-medium text-gray-700 mb-1">
        Number of items to fetch: {searchState.amount}
      </label>
      <input
        id="amountSlider"
        type="range"
        min="1"
        max="50"
        value={searchState.amount}
        onChange={handleAmountChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1</span>
        <span>25</span>
        <span>50</span>
      </div>
    </div>
  );
};

export default AmountSelector;
