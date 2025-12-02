import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { setCollection } from '../../shared/state/librarySearch/librarySlice';
import { changeCollection } from '../../shared/state/librarySearch/libraryThunks';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";

interface CollectionSelectorProps {
  onCollectionChange?: (collection: 'NFT' | 'SBT') => void;
}

export default function CollectionSelector({ onCollectionChange }: CollectionSelectorProps) {
  const collection = useSelector((state: RootState) => state.library.collection);
  const dispatch = useDispatch<AppDispatch>();

  const handleCollectionChange = (value: string) => {
    if (value === 'NFT' || value === 'SBT') {
      if (onCollectionChange) {
        // Use custom handler if provided
        onCollectionChange(value as 'NFT' | 'SBT');
      } else {
        // Use the enhanced changeCollection thunk to update pagination and fetch new data
        dispatch(changeCollection(value as 'NFT' | 'SBT'));
      }
    }
  };

  return (
    <div className="flex-1">
      <div className="p-[14px] rounded-2xl border border-input bg-background">
        <ToggleGroup
          type="single"
          value={collection}
          onValueChange={handleCollectionChange}
          className="flex gap-2"
        >
          <ToggleGroupItem
            value="NFT"
            variant="collection"
            className="px-4 py-2 text-sm font-medium rounded-[30px] transition-colors"
          >
            NFTs
          </ToggleGroupItem>
          <ToggleGroupItem
            value="SBT"
            variant="collection"
            className="px-4 py-2 text-sm font-medium rounded-[30px] transition-colors"
          >
            SBTs
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
