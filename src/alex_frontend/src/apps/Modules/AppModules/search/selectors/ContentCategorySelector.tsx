import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fileTypeCategories } from '@/apps/Modules/shared/types/files';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";

const ContentCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const { contentCategory } = useSelector((state: RootState) => state.arweave.searchState);

  const handleCategoryChange = (value: string) => {
    dispatch(setSearchState({ contentCategory: value }));
  };

  return (
    <Select 
      value={contentCategory} 
      onValueChange={handleCategoryChange}
    >
      <SelectTrigger className="w-full p-[14px] rounded-2xl">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="favorites">Popular</SelectItem>
        {Object.keys(fileTypeCategories)
          .filter(category => category !== 'favorites')
          .map((category) => (
            <SelectItem 
              key={category} 
              value={category}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export default ContentCategorySelector;
