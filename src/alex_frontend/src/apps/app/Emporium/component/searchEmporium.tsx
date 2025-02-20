import React from 'react';
import styled from 'styled-components';
import { Search as icon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { setSearchEmporium } from '../emporiumSlice';
import { useTheme } from '@/providers/ThemeProvider';

export const OwnerIcon = styled(icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

export const SearchBox = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  height: 50px;
  padding: 16px 20px;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--black-grey-400, #CCC);
 

`;

export const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  color: var(--black-grey-300, #808080);
  font-family: Syne;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &::placeholder {
    color: var(--black-grey-300, #808080);
  }
`;



const SearchEmporium = () => {
  const dispatch=useAppDispatch();
  const emporium =useAppSelector(state=>state.emporium);
   const { theme } = useTheme();
    const isDark = theme === "dark";
  
  
  const handleSearchStateChange = (value: string) => {
    dispatch(setSearchEmporium({
      ...emporium.search,
      search:value
    }));
  };

  return (
    <SearchBox className={isDark ? 'border-border bg-gray-900' : 'border-gray-300 bg-gray-50'}>
      <OwnerIcon />
      <Input
        value={emporium.search.search}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="Search" 
        className={isDark ?  'border-border bg-gray-900' : 'border-gray-300 bg-gray-50'}
      />
    </SearchBox>
  );
};
export default SearchEmporium;

