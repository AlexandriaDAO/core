import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { performSearch } from '../../shared/state/nft/libraryThunks';
import { Button } from "@/lib/components/button";
import { Search } from "lucide-react";

export default function SearchButton() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = () => {
    dispatch(performSearch());
  };

  return (
    <Button 
      onClick={handleSearch}
      className="flex items-center gap-2 bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90"
    >
      <Search className="h-4 w-4" />
      Search
    </Button>
  );
}
