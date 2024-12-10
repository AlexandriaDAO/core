import React, { useEffect } from "react";
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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <Button 
      onClick={handleSearch}
      className="flex h-[60px] min-w-[280px] items-center justify-center gap-[10px] rounded-[30px] border-none bg-[#353535] px-6 py-[10px] font-['Syne'] text-base text-white hover:bg-[#353535]/90"
    >
      <Search className="h-4 w-4" />
      Search
    </Button>
  );
}
