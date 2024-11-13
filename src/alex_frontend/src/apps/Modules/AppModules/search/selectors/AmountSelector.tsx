import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { Slider } from '@/lib/components/slider';
import { Label } from '@/lib/components/label';

const AmountSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleAmountChange = (value: number[]) => {
    dispatch(setSearchState({ amount: value[0] }));
  };

  return (
    <div className="mt-4 space-y-2">
      <Label htmlFor="amount">
        Results: {searchState.amount}
      </Label>
      <Slider
        id="amount"
        min={1}
        max={50}
        step={1}
        value={[searchState.amount]}
        onValueChange={handleAmountChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>25</span>
        <span>50</span>
      </div>
    </div>
  );
};

export default AmountSelector;
