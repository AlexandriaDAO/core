import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { toggleSort } from '../../shared/state/nft/libraryThunks';

export default function SortSelector() {
  const sortAsc = useSelector((state: RootState) => state.library.sortAsc);
  const dispatch = useDispatch<AppDispatch>();

  const handleSort = () => {
    dispatch(toggleSort());
  };

  return (
    <button
      onClick={handleSort}
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
    >
      Sort {sortAsc ? "↑" : "↓"}
    </button>
  );
} 