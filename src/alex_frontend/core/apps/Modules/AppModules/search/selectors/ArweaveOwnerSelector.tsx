import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { Search } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

const ArweaveOwnerSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  const [isValid, setIsValid] = React.useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSearchStateChange = (value: string) => {
    const cleanValue = value.trim();
    dispatch(setSearchState({ ownerFilter: cleanValue }));
    
    if (cleanValue) {
      setIsValid(isValidArweaveAddress(cleanValue));
    } else {
      setIsValid(true);
    }
  };

  return (
    <div className={`flex w-full max-w-[800px] h-[50px] md:h-[60px] p-3 md:p-5 items-center rounded-[25px] md:rounded-[30px] border ${isDark ? 'border-border bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
      <Search className={`w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 ${isDark ? 'text-gray-400' : 'text-black'}`} />
      <input
        className={`flex-1 border-none outline-none bg-transparent font-syne text-sm md:text-lg ${isDark ? 'placeholder:text-gray-500' : 'placeholder:text-black/60'} ${!isValid ? 'text-destructive' : isDark ? 'text-foreground' : 'text-black'}`}
        value={searchState.ownerFilter}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="paste owner address"
        title={!isValid ? "Please enter a valid Arweave address (43 characters)" : ""}
      />
    </div>
  );
};

// Add validation helper
const isValidArweaveAddress = (address: string): boolean => {
  const cleanAddress = address.trim();
  const base64urlRegex = /^[a-zA-Z0-9_-]{43}$/;
  return base64urlRegex.test(cleanAddress);
};

export default ArweaveOwnerSelector;
