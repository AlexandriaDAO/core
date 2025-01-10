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
    if (value === 'icrc7' || value === 'icrc7_scion') {
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
            value="icrc7"
            className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors
              ${collection === 'icrc7'
                ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90'
                : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'}`}
          >
            NFTs
          </ToggleGroupItem>
          <ToggleGroupItem
            value="icrc7_scion"
            className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors
              ${collection === 'icrc7_scion'
                ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90'
                : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'}`}
          >
            SBTs
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
