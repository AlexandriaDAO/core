import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { setCollection } from '../../shared/state/librarySearch/librarySlice';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";

export default function CollectionSelector() {
  const collection = useSelector((state: RootState) => state.library.collection);
  const dispatch = useDispatch<AppDispatch>();

  const handleCollectionChange = (value: string) => {
    if (value === 'NFT' || value === 'SBT') {
      dispatch(setCollection(value));
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
