import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";

const AmountSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { amount } = useSelector((state: RootState) => state.arweave.searchState);

  const handleAmountChange = (value: string) => {
    dispatch(setSearchState({ amount: parseInt(value) }));
  };

  return (
    <Select 
      value={amount.toString()} 
      onValueChange={handleAmountChange}
    >
      <SelectTrigger className="w-full p-[14px] rounded-2xl">
        <SelectValue placeholder="Select amount" />
      </SelectTrigger>
      <SelectContent>
        {[6, 12, 20, 30, 40, 50].map((value) => (
          <SelectItem 
            key={value} 
            value={value.toString()}
          >
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AmountSelector;
