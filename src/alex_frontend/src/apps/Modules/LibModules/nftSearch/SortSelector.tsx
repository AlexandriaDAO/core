import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { toggleSort } from '../../shared/state/nft/libraryThunks';
import { Toggle } from "@/lib/components/toggle";
import { ArrowUpDown } from "lucide-react";

export default function SortSelector() {
  const sortAsc = useSelector((state: RootState) => state.library.sortAsc);
  const dispatch = useDispatch<AppDispatch>();

  const handleSort = () => {
    dispatch(toggleSort());
  };

  return (
    <Toggle
      pressed={sortAsc}
      onPressedChange={handleSort}
      variant="outline"
      size="sm"
      aria-label="Toggle sort direction"
    >
      <ArrowUpDown className={`h-4 w-4 ${sortAsc ? 'rotate-180' : ''} transition-transform duration-200`} />
    </Toggle>
  );
} 